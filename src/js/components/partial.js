var Partial = (function(){

  function Partial(options){
    //super()
    Colleague.call(this, options.mediator);

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
    this.register();
  }

  //Binding the prototype of the Parent object
  //Properties will be overriden on this one.
  Partial.prototype = Object.create(Colleague.prototype);

  //Binding the constructor to the prototype
  Partial.prototype.constructor = Colleague;

  //Creating a parent property (like super in Java)
  //Allows to call overriden properties
  Partial.prototype.parent = Colleague.prototype;

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
    switch(this.scale){
      case Partial.prototype.enum.scales.day:
      case Partial.prototype.enum.scales.week:
        this.emit(Events.masterupdate.mis, {date: this.date});
        this.emit(Events.masterupdate.yis, {date: this.date});
        this.emit(Events.masterupdate.cal, {date: this.date});
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

  Partial.prototype.commit = function () {
    this.prev_date.setUTCFullYear(this.date.getUTCFullYear());
    this.prev_date.setUTCMonth(this.date.getUTCMonth());
    this.prev_date.setUTCDate(this.date.getUTCDate());
  };

  // Partial.prototype.uiApply = function(scale) {
  //   var val, uuid;
  //   if(scale === undefined){
  //     var updateCal = false;
  //     if(this.uidate.getUTCFullYear() !== this.date.getUTCFullYear()){
  //       this.uiApply(Partial.prototype.scales.year);
  //       updateCal = true;
  //       this.uidate.setUTCFullYear(this.date.getUTCFullYear());
  //       this.uidate.setUTCDate(this.date.getUTCDate());
  //     }
  //     if(this.uidate.getUTCMonth() !== this.date.getUTCMonth()){
  //       this.uiApply(Partial.prototype.scales.month);
  //       updateCal = true;
  //       this.uidate.setUTCMonth(this.date.getUTCMonth());
  //       this.uidate.setUTCDate(this.date.getUTCDate());
  //     }
  //     if(this.uidate.getUTCDate() !== this.date.getUTCDate()){
  //       this.uiApply(Partial.prototype.scales.day);
  //       this.uidate.setUTCDate(this.date.getUTCDate());
  //     }
  //     if(updateCal){
  //       this.updateCalendarHTML();
  //     }
  //   }else{
  //     for(uuid in this.uicallbacks[scale]){
  //       val = this.uicallbacks[scale][uuid];
  //       if(val.status === Partial.prototype.statuses.active){
  //         val.function.call(this);
  //       }
  //     }
  //   }
  // };


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

  Partial.prototype.register = function () {
    switch(this.scale){
      case Partial.prototype.enum.scales.day:
      case Partial.prototype.enum.scales.week:
        this.mediator.register(Events.masterupdate.yis, this.components.yinput);
        this.mediator.register(Events.masterupdate.mis, this.components.minput);
        this.mediator.register(Events.masterupdate.cal, this.components.calendar);
        this.mediator.register(Events.slaveupdate.mis, this);
        this.mediator.register(Events.slaveupdate.yis, this);
        this.mediator.register(Events.slaveupdate.cal, this);
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
    switch(e.name){
      case Events.slaveupdate.mis:
        if(this.scale === Partial.prototype.enum.scales.day || this.scale === Partial.prototype.enum.scales.week){
          this.emit(Events.masterupdate.yis, e.data);
          this.emit(Events.masterupdate.cal, e.data);
        }
        break;
      case Events.slaveupdate.yis:
        if(this.scale === Partial.prototype.enum.scales.day || this.scale === Partial.prototype.enum.scales.week){
          this.emit(Events.masterupdate.mis, e.data);
          this.emit(Events.masterupdate.cal, e.data);
        }else if(this.scale === Partial.prototype.enum.scales.month){
          //TODO: determine which events must be sent
        }
        break;
      case Events.slaveupdate.cal:
        if(this.scale === Partial.prototype.enum.scales.day || this.scale === Partial.prototype.enum.scales.week){
          this.emit(Events.masterupdate.yis, e.data);
          this.emit(Events.masterupdate.mis, e.data);
        }
        break;
      //TODO: Add other cases for the other scales
      default:
        break;
    }
    this.constructor.prototype.notify.call(this, e);
  };

  return Partial;
})();
