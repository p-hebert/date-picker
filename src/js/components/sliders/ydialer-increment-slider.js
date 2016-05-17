var YDialerIncrementSlider = (function(){
  function YDialerIncrementSlider(options, component){
    //super()
    component = component === undefined? YDialerIncrementSlider.prototype.component : component;
    IncrementSlider.call(this, options, component);
    this.mediation.events.emit.ydupdate = this._constructEventString(Events.scope.emit, Events.desc.update.yds);
    //Upper/Lower bounds to date value
    this.min_date = options.min_date instanceof Date ?
                    new Date(options.min_date.getUTCFullYear(), options.min_date.getUTCMonth(), options.min_date.getUTCDate()) :
                    undefined;
    this.max_date = options.max_date instanceof Date && options.max_date > this.min_date?
                    new Date(options.max_date.getUTCFullYear(), options.max_date.getUTCMonth(), options.max_date.getUTCDate()) :
                    undefined;

    //Date that is modified by the user
    this.date = new Date(options.date.getUTCFullYear(), options.date.getUTCMonth(), options.date.getUTCDate());

    this.index = 0;
    this.updateRange();
    this.generateHTML();
  }

  //Binding the prototype of the Parent object
  //Properties will be overriden on this one.
  YDialerIncrementSlider.prototype = Object.create(IncrementSlider.prototype);

  //Binding the constructor to the prototype
  YDialerIncrementSlider.prototype.constructor = IncrementSlider;

  //Component for Event Strings
  YDialerIncrementSlider.prototype.component = 'YDINCSLIDER';

  YDialerIncrementSlider.prototype.enum = {
    callbacks: {
      notify: "notify",
      emit: "emit",
      prev: "prev",
      datechange: "datechange",
      next: "next",
      event: "event"
    }
  };

  YDialerIncrementSlider.prototype.setDate = function(date){
    this.date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    this.callCallback(IncrementSlider.prototype.enum.datechange);
  };

  YDialerIncrementSlider.prototype.updateRange = function () {
    var medianyear = this.date.getUTCFullYear(),
        factor = (8 - NumberUtils.mod(medianyear, 8));
    if(this.range === undefined){
      this.range = {};
      this.range.max = factor === 8? medianyear : medianyear + factor;
      this.range.min = this.range.max - 7;
      this.range.init_max = this.range.max;
      this.range.init_min = this.range.min;
    }else{
      this.range.max = factor === 8? medianyear : medianyear + factor;
      this.range.min = this.range.max - 7;
    }
  };

  YDialerIncrementSlider.prototype.update = function () {
    this.updateRange();
    this.index = (this.range.max - this.range.init_max)/8;
  };

  YDialerIncrementSlider.prototype.onPrevClick = function () {
    if(this.prev.isDisabled === true){
      return;
    }
    if(this.min_date === undefined || this.range.max - 8 >= this.min_date.getUTCFullYear()){
      this.range.max -= 8 ;
      this.range.min -= 8 ;
      this.index--;
      this.updateUIControls();
      this.emit(this.mediation.events.emit.ydupdate, {index: this.index});
      IncrementSlider.prototype.onPrevClick.call(this);
    }
  };

  YDialerIncrementSlider.prototype.onNextClick = function () {
    if(this.next.isDisabled === true){
      return;
    }
    if(this.max_date === undefined || this.range.min + 8 <= this.max_date.getUTCFullYear()){
      this.range.max += 8 ;
      this.range.min += 8 ;
      this.index++;
      this.updateUIControls();
      this.emit(this.mediation.events.emit.ydupdate, {index: this.index});
      IncrementSlider.prototype.onPrevClick.call(this);
    }
  };

  /**
  * @override
  **/
  YDialerIncrementSlider.prototype.testMin = function () {
    return this.min_date !== undefined && this.min_date.getUTCFullYear() >= this.range.min;
  };

  /**
  * @override
  **/
  YDialerIncrementSlider.prototype.testMax = function () {
    return this.max_date !== undefined && this.max_date.getUTCFullYear() <= this.range.max;
  };

  YDialerIncrementSlider.prototype.subscribe = function (parent) {
    if(parent !== undefined){
      this.mediator.subscribe(this.mediation.events.emit.ydupdate, parent);
    }
  };

  /**
  * @override
  **/
  YDialerIncrementSlider.prototype.notify = function (e) {
    if(e.scope === Events.scope.broadcast){
      switch(e.desc){
        case Events.desc.update.partial:
          if(e.data.min_date !== undefined && e.data.date instanceof Date){
            this.min_date = new Date(e.data.min_date.getUTCFullYear(), e.data.min_date.getUTCMonth(), e.data.min_date.getUTCDate());
          }
          if(e.data.max_date !== undefined && e.data.date instanceof Date && e.data.max_date >= e.data.min_date){
            this.max_date = new Date(e.data.max_date.getUTCFullYear(), e.data.max_date.getUTCMonth(), e.data.max_date.getUTCDate());
          }
        case Events.desc.update.yds:
          if(e.data.date !== undefined && e.data.date instanceof Date){
            this.setDate(e.data.date);
            this.update();
          }
          if(this.min_date > this.date){
            this.setDate(this.min_date);
            this.update();
          }
          if(this.max_date < this.date){
            this.setDate(this.max_date);
            this.update();
          }
          this.updateUIControls();
          break;
        default:
          break;
      }
    }
    IncrementSlider.prototype.notify.call(this, e);
  };


  return YDialerIncrementSlider;

})();
