var Partial = (function(){

  function Partial(options, parent){
    //super()
    Colleague.call(this, options.mediator, Partial.prototype.component);
    this.mediation.events.broadcast.pupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.partial);
    this.mediation.events.broadcast.cupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.cal);
    this.mediation.events.broadcast.mupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.mis);
    this.mediation.events.broadcast.yupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.yis);
    this.mediation.events.emit.pupdate = this._constructEventString(Events.scope.emit, Events.desc.update[options.scale]);
    //Date that is modified by the user
    this.date = new Date(options.date.getUTCFullYear(), options.date.getUTCMonth(), options.date.getUTCDate());

    //Saved state in case of rollback
    this.prev_date = new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate());

    //Scale for this instance
    this.scale = (options.scale && Calendar.prototype.enum.scales[options.scale]) ?
                 Calendar.prototype.enum.scales[options.scale] :
                 Calendar.prototype.enum.scales.day;

    //UI components of which the Partial is comprised.
    this.components = {};
    this.generateHTML(options);
  }

  //Binding the prototype of the Parent object
  //Properties will be overriden on this one.
  Partial.prototype = Object.create(Colleague.prototype);

  //Binding the constructor to the prototype
  Partial.prototype.constructor = Colleague;

  //Component for Event Strings
  Partial.prototype.component = 'PARTIAL';

  Partial.prototype.enum = {
    scales: {
      day : "day",
      week : "week",
      month : "month",
      year : "year"
    }
  };

  Partial.prototype.getHTML = function(){
    return this.html;
  };

  Partial.prototype.rollback = function () {
    this.date.setUTCFullYear(this.prev_date.getUTCFullYear());
    this.date.setUTCMonth(this.prev_date.getUTCMonth());
    this.date.setUTCDate(this.prev_date.getUTCDate());
    var date = new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate());
    this.emit(this.mediation.events.broadcast.pupdate, {date: date});
  };

  Partial.prototype.commit = function () {
    this.prev_date.setUTCFullYear(this.date.getUTCFullYear());
    this.prev_date.setUTCMonth(this.date.getUTCMonth());
    this.prev_date.setUTCDate(this.date.getUTCDate());
  };

  Partial.prototype.generateHTML = function(options){
    switch(this.scale){
      case Partial.prototype.enum.scales.day:
      case Partial.prototype.enum.scales.week:
        this.html = this.calendarPartialHTML(options);
        break;
      case Partial.prototype.enum.scales.month:
        this.html = this.monthlyPartialHTML(options);
        break;
      case Partial.prototype.enum.scales.year:
        this.html = this.yearlyPartialHTML(options);
        break;
      default:
        break;
    }
  };

  Partial.prototype.calendarPartialHTML = function (options) {
    var container = document.createElement('div'),
        wrapper = document.createElement('div');
    options.min_value = options.min_date;
    options.max_value = options.max_date;
    this.components.yinput = new YearIncrementSlider(options);
    this.components.minput = new MonthIncrementSlider(options);
    this.components.calendar = new Calendar(options);

    if(this.scale === Partial.prototype.enum.scales.day){
      container.className = "date-picker-mode-day active";
      wrapper.className = "date-picker-content-wrapper";
    }else if(this.scale === Partial.prototype.enum.scales.week){
      container.className = "date-picker-mode-week active";
      wrapper.className = "date-picker-content-wrapper";
    }

    wrapper.appendChild(this.components.yinput.getHTML());
    wrapper.appendChild(this.components.minput.getHTML());
    wrapper.appendChild(this.components.calendar.getHTML());
    container.appendChild(wrapper);
    return container;
  };

  Partial.prototype.monthlyPartialHTML = function (options) {

  };

  Partial.prototype.yearlyPartialHTML = function (options) {

  };

  Partial.prototype.subscribe = function (parent) {
    if(parent !== undefined){
      this.mediator.subscribe(this.mediation.events.emit.pupdate, parent);
    }
    switch(this.scale){
      case Partial.prototype.enum.scales.day:
      case Partial.prototype.enum.scales.week:
        this.mediator.subscribe(this.mediation.events.broadcast.pupdate, this.components.yinput);
        this.mediator.subscribe(this.mediation.events.broadcast.pupdate, this.components.minput);
        this.mediator.subscribe(this.mediation.events.broadcast.pupdate, this.components.calendar);
        this.mediator.subscribe(this.mediation.events.broadcast.yupdate, this.components.yinput);
        this.mediator.subscribe(this.mediation.events.broadcast.mupdate, this.components.minput);
        this.mediator.subscribe(this.mediation.events.broadcast.cupdate, this.components.calendar);
        this.components.yinput.subscribe(this);
        this.components.minput.subscribe(this);
        this.components.calendar.subscribe(this);
        break;
      case Partial.prototype.enum.scales.month:
        //TODO
        break;
      case Partial.prototype.enum.scales.year:
        //TODO
        break;
      default:
        break;
    }
  };

  /**
  * @override
  **/
  Partial.prototype.notify = function (e) {
      if(e.scope === Events.scope.emit){
        switch(e.desc){
          case Events.desc.update.mis:
            this.emit(this.mediation.events.broadcast.yupdate, e.data);
            this.emit(this.mediation.events.broadcast.cupdate, e.data);
            break;
          case Events.desc.update.yis:
            this.emit(this.mediation.events.broadcast.mupdate, e.data);
            this.emit(this.mediation.events.broadcast.cupdate, e.data);
            break;
          case Events.desc.update.cal:
            this.emit(this.mediation.events.broadcast.mupdate, e.data);
            this.emit(this.mediation.events.broadcast.yupdate, e.data);
            break;
        }
        this.emit(this.mediation.events.emit.pupdate, e.data);
      }else if (e.scope === Events.scope.broadcast){
        this.emit(this.mediation.events.broadcast.pupdate, e.data);
        if(e.data.min_date !== undefined && e.data.date instanceof Date){
          this.min_date = new Date(e.data.min_date.getUTCFullYear(), e.data.min_date.getUTCMonth(), e.data.min_date.getUTCDate());
        }
        if(e.data.max_date !== undefined && e.data.date instanceof Date){
          this.max_date = new Date(e.data.max_date.getUTCFullYear(), e.data.max_date.getUTCMonth(), e.data.max_date.getUTCDate());
        }
      }

      if(e.data.date !== undefined && e.data.date instanceof Date){
        this.date = new Date(e.data.date.getUTCFullYear(), e.data.date.getUTCMonth(), e.data.date.getUTCDate());
      }

    this.constructor.prototype.notify.call(this, e);
  };

  return Partial;
})();
