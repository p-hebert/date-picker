var YearIncrementSlider = (function(){
  function YearIncrementSlider(options, component){
    //super()
    component = component === undefined? YearIncrementSlider.prototype.component : component;
    IncrementSlider.call(this, options, component);
    this.mediation.events.emit.yupdate = this._constructEventString(Events.scope.emit, Events.desc.update.yis);
    this.date = this.value;
    this.min_date = this.min_value;
    this.max_date = this.max_value;
    this.generateHTML();
  }

  //Binding the prototype of the Parent object
  //Properties will be overriden on this one.
  YearIncrementSlider.prototype = Object.create(IncrementSlider.prototype);

  //Binding the constructor to the prototype
  YearIncrementSlider.prototype.constructor = IncrementSlider;

  //Component for Event Strings
  YearIncrementSlider.prototype.component = 'YINCSLIDER';

  /**
  * @override
  **/
  YearIncrementSlider.prototype.setValue = function(value){
    this.date = new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
    this.value = this.date;
    this.setUIValue();
    this.callCallback(IncrementSlider.prototype.enum.callbacks.valuechange);
  };

  YearIncrementSlider.prototype.setMinValue = function(value){
    if(value instanceof Date &&
      (this.max_date === undefined || value < this.max_date)){
      this.min_date = new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
      this.min_value = this.min_date;
      this.callCallback(IncrementSlider.prototype.enum.callbacks.minchange);
    }
  };

  YearIncrementSlider.prototype.setMaxValue = function(value){
    if(value instanceof Date &&
      (this.min_date === undefined || value > this.min_date)){
      this.max_date = new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
      this.max_value = this.max_date;
      this.callCallback(IncrementSlider.prototype.enum.callbacks.maxchange);
    }
  };

  /**
  * @override
  **/
  YearIncrementSlider.prototype.setUIValue = function(){
    this.input.children[0].innerHTML = this.date.getUTCFullYear();
  };

  /**
  * @override
  **/
  YearIncrementSlider.prototype.testMin = function () {
    return this.min_date !== undefined && this.min_date.getUTCFullYear() === this.date.getUTCFullYear();
  };

  /**
  * @override
  **/
  YearIncrementSlider.prototype.testMax = function () {
    return this.max_date !== undefined && this.max_date.getUTCFullYear() === this.date.getUTCFullYear();
  };

  /**
  * @override
  **/
  YearIncrementSlider.prototype.onPrevClick = function () {
    if(this.prev.isDisabled === true){
      return;
    }
    var year = this.date.getUTCFullYear() - 1,
        daysInMonth = DateUtils.daysInMonth(this.date.getUTCFullYear() - 1, this.date.getUTCMonth()),
        uiday = false, uimonth = false, uiyear = false;
    //Checks if action is legal (not going below min year)
    if(this.min_date === undefined || this.min_date.getUTCFullYear() <= year){
      //To prevent invalid dates like Feb 30th
      if(this.date.getUTCDate() > daysInMonth){

        this.date.setUTCDate(daysInMonth);
      }

      this.date.setUTCFullYear(year);
      //Making sure that we are not going below the min date on the smaller scales than year
      if(this.min_date !== undefined && this.min_date.getUTCFullYear() === this.date.getUTCFullYear()){
        if(this.min_date.getUTCMonth() > this.date.getUTCMonth()){
          this.date.setUTCMonth(this.min_date.getUTCMonth());
          this.date.setUTCDate(this.min_date.getUTCDate());
        }else if(this.min_date.getUTCDay() > this.date.getUTCDate() && this.min_date.getUTCMonth() === this.date.getUTCMonth()){
          this.date.setUTCDate(this.min_date.getUTCDate());
        }
      }
      this.setValue(this.date);
      this.updateUIControls();
      this.emit(this.mediation.events.emit.yupdate, {date: this.date});
      IncrementSlider.prototype.onPrevClick.call(this);
    }
    //else do nothing
  };

  /**
  * @override
  **/
  YearIncrementSlider.prototype.onNextClick = function () {
    if(this.next.isDisabled === true){
      return;
    }
    var year = this.date.getUTCFullYear() + 1,
        daysInMonth = DateUtils.daysInMonth(this.date.getUTCFullYear() + 1, this.date.getUTCMonth());
    //Checks if action is legal (not going below min year)
    if(this.max_date === undefined || this.max_date.getUTCFullYear() >= year){

      //To prevent invalid dates like Feb 30th
      if(this.date.getUTCDate() > daysInMonth){
        this.date.setUTCDate(daysInMonth);
      }

      this.date.setUTCFullYear(year);

      //Making sure that we are not going above the max date on the smaller scales than year
      if(this.max_date !== undefined && this.max_date.getUTCFullYear() === year){
        if(this.max_date.getUTCMonth() < this.date.getUTCMonth()){
          this.date.setUTCMonth(this.max_date.getUTCMonth());
          this.date.setUTCDate(this.max_date.getUTCDate());
        }else if(this.max_date !== undefined && this.max_date.getUTCDay() > this.date.getUTCDate() && this.min_date.getUTCMonth() === this.date.getUTCMonth()){
          this.date.setUTCDate(this.max_date.getUTCDate());
        }
      }

      this.setValue(this.date);
      this.updateUIControls();
      this.emit(this.mediation.events.emit.yupdate, {date: this.date});
      IncrementSlider.prototype.onNextClick.call(this);
    }
    //else do nothing
  };

  YearIncrementSlider.prototype.subscribe = function (parent) {
    if(parent !== undefined){
      this.mediator.subscribe(this.mediation.events.emit.yupdate, parent);
    }
  };

  /**
  * @override
  **/
  YearIncrementSlider.prototype.notify = function (e) {
    if(e.scope === Events.scope.broadcast){
      switch(e.desc){
        case Events.desc.update.partial:
          if(e.data.min_date !== undefined){
            this.setMinValue(e.data.min_date);
          }
          if(e.data.max_date !== undefined){
            this.setMaxValue(e.data.max_date);
          }
        case Events.desc.update.yis:
          if(e.data.date !== undefined && e.data.date instanceof Date){
            this.setValue(e.data.date);
          }
          this.updateUIControls();
          break;
        case Events.desc.request.decrement.year:
          this.onPrevClick();
          break;
        case Events.desc.request.increment.year:
          this.onNextClick();
          break;
        default:
          break;
      }
    }
    IncrementSlider.prototype.notify.call(this, e);
  };

  return YearIncrementSlider;
})();
