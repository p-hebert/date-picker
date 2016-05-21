var MonthIncrementSlider = (function(){
  function MonthIncrementSlider(options, component){
    //super()
    component = component === undefined? MonthIncrementSlider.prototype.component : component;
    IncrementSlider.call(this, options, component);
    this.mediation.events.emit.mupdate = this._constructEventString(Events.scope.emit, Events.desc.update.mis);
    this.lang = options.lang !== undefined &&
                MonthIncrementSlider.prototype.enum.languages[options.lang] !== undefined ?
                MonthIncrementSlider.prototype.enum.languages[options.lang] : 'en';
    this.date = this.value;
    this.min_date = this.min_value;
    this.max_date = this.max_value;
    this.generateHTML();
  }

  //Binding the prototype of the Parent object
  //Properties will be overriden on this one.
  MonthIncrementSlider.prototype = Object.create(IncrementSlider.prototype);

  //Binding the constructor to the prototype
  MonthIncrementSlider.prototype.constructor = IncrementSlider;

  //Component for Event Strings
  MonthIncrementSlider.prototype.component = 'MINCSLIDER';

  //Enumerable Values
  //Building upon prototype
  MonthIncrementSlider.prototype.enum = IncrementSlider.prototype.enum;

  MonthIncrementSlider.prototype.enum.languages = {
    en: 'en',
    fr: 'fr'
  };

  /**
  * @override
  **/
  MonthIncrementSlider.prototype.setValue = function(value){
    this.date = new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
    this.value = this.date;
    this.setUIValue();
    this.callCallback(IncrementSlider.prototype.enum.callbacks.valuechange);
  };

  /**
  * @override
  **/
  MonthIncrementSlider.prototype.setUIValue = function(){
    this.input.children[0].innerHTML = DateUtils.getMonthString(this.date.getUTCMonth(), this.lang);
  };

  /**
  * @override
  **/
  MonthIncrementSlider.prototype.testMin = function () {
    return this.min_date !== undefined &&
      this.min_date.getUTCFullYear() === this.date.getUTCFullYear() && this.min_date.getUTCMonth() === this.date.getUTCMonth();
  };

  /**
  * @override
  **/
  MonthIncrementSlider.prototype.testMax = function () {
    return this.max_date !== undefined &&
      this.max_date.getUTCFullYear() === this.date.getUTCFullYear() && this.max_date.getUTCMonth() === this.date.getUTCMonth();
  };

  /**
  * @override
  **/
  MonthIncrementSlider.prototype.onPrevClick = function() {
    if(this.prev.isDisabled === true){
      return;
    }
    var self = this;
    var year = this.date.getUTCFullYear(),
        month = NumberUtils.mod(this.date.getUTCMonth() - 1, 12),
        apply = false;
    //If no min_date, no constraints.
    if(this.min_date === undefined || this.min_date.getUTCFullYear() < year-1){
      apply = true;
      this.decrementMonth();
      if(month === 11){
        this.date.setUTCFullYear(year - 1);
      }
    //If min year is = to year, must check for month and day.
    }else if(this.min_date.getUTCFullYear() === year && month !== 11){
      //Check if action is valid
      if(this.min_date.getUTCMonth() < month || this.min_date.getUTCMonth() === month){
        apply = true;
        this.decrementMonth();
      }
      //Granted min month = month
      //Resets the day if conflict between min day and currently selected day
      if(this.min_date.getUTCMonth() === month && this.min_date.getUTCDay() > this.date.getUTCDay()){
        this.date.setUTCDate(this.min_date.getUTCDate());
      }

    }else if(this.min_date.getUTCFullYear() === year - 1 && month === 11){
      if(this.min_date.getUTCMonth() < month || this.min_date.getUTCMonth() === month){
        apply = true;
        this.decrementMonth();
        this.date.setUTCFullYear(year - 1);
      }

      if(this.min_date.getUTCMonth() === month && this.min_date.getUTCDay() > this.date.getUTCDay()){
        this.date.setUTCDate(this.min_date.getUTCDate());
      }

    }else if(this.min_date.getUTCFullYear() === year - 1 && month !== 11){
      apply = true;
      this.decrementMonth();
    }

    if(apply){
      this.setValue(this.date);
      this.updateUIControls();
      this.emit(this.mediation.events.emit.mupdate, {date: this.date});
      IncrementSlider.prototype.onPrevClick.call(this);
    }
  };

  /**
  * @override
  **/
  MonthIncrementSlider.prototype.onNextClick = function () {
    if(this.next.isDisabled === true){
      return;
    }
    var year = this.date.getUTCFullYear(),
        month = NumberUtils.mod(this.date.getUTCMonth() + 1, 12),
        apply = false;
    //If no max_date, no constraints.
    if(this.max_date === undefined || this.max_date.getUTCFullYear() > year+1){
      apply = true;
      this.incrementMonth();
      if(month === 0){
        this.date.setUTCFullYear(year + 1);
      }
    //If max year is = to year, must check for month and day.
    }else if(this.max_date.getUTCFullYear() === year && month !== 0){
      //Check if action is valid
      if(this.max_date.getUTCMonth() > month || this.max_date.getUTCMonth() === month){
        apply = true;
        this.incrementMonth();
      }
      //Granted max month = month
      //Resets the day if conflict between max day and currently selected day
      if(this.max_date.getUTCMonth() === month && this.max_date.getUTCDay() < this.date.getUTCDay()){
        this.date.setUTCDate(this.max_date.getUTCDate());
      }

    }else if(this.max_date.getUTCFullYear() === year + 1 && month === 0){
      if(this.max_date.getUTCMonth() > month || this.max_date.getUTCMonth() === month){
        apply = true;
        this.incrementMonth();
        this.date.setUTCFullYear(year + 1);
      }

      if(this.max_date.getUTCMonth() === month && this.max_date.getUTCDay() < this.date.getUTCDay()){
        this.date.setUTCDate(this.max_date.getUTCDate());
      }

    }else if(this.max_date.getUTCFullYear() === year + 1 && month !== 0){
      apply = true;
      this.incrementMonth();
    }else{
      //do nothing
    }

    if(apply){
      this.setValue(this.date);
      this.updateUIControls();
      this.emit(this.mediation.events.emit.mupdate, {date: this.date});
      IncrementSlider.prototype.onNextClick.call(this);
    }
  };

  MonthIncrementSlider.prototype.incrementMonth = function () {
    var month = NumberUtils.mod(this.date.getUTCMonth() + 1, 12),
        daysInMonth = month !== 0 ?
                      DateUtils.daysInMonth(this.date.getUTCFullYear(), month):
                      DateUtils.daysInMonth(this.date.getUTCFullYear() + 1, month);
    //To prevent invalid dates like Feb 30th
    //Takes in account change of year
    if(this.date.getUTCDate() > daysInMonth){
      this.date.setUTCDate(daysInMonth);
    }
    this.date.setUTCMonth(month);
  };

  MonthIncrementSlider.prototype.decrementMonth = function () {
    var month = NumberUtils.mod(this.date.getUTCMonth() - 1, 12),
        daysInMonth = month !== 11 ?
                      DateUtils.daysInMonth(this.date.getUTCFullYear(), month):
                      DateUtils.daysInMonth(this.date.getUTCFullYear() - 1, month);
    //To prevent invalid dates like Feb 30th
    //Takes in account change of year
    if(this.date.getUTCDate() > daysInMonth){
      this.date.setUTCDate(daysInMonth);
    }
    this.date.setUTCMonth(month);
  };

  MonthIncrementSlider.prototype.subscribe = function (parent) {
    if(parent !== undefined){
      this.mediator.subscribe(this.mediation.events.emit.mupdate, parent);
    }
  };

  /**
  * @override
  **/
  MonthIncrementSlider.prototype.notify = function (e) {
    if(e.scope === Events.scope.broadcast){
      switch(e.desc){
        case Events.desc.update.partial:
          if(e.data.min_date !== undefined && e.data.date instanceof Date){
            this.min_date = new Date(e.data.min_date.getUTCFullYear(), e.data.min_date.getUTCMonth(), e.data.min_date.getUTCDate());
          }
          if(e.data.max_date !== undefined && e.data.date instanceof Date){
            this.max_date = new Date(e.data.max_date.getUTCFullYear(), e.data.max_date.getUTCMonth(), e.data.max_date.getUTCDate());
          }
        case Events.desc.update.mis:
          if(e.data.date !== undefined && e.data.date instanceof Date){
            this.setValue(e.data.date);
          }
          this.updateUIControls();
          break;
        case Events.desc.request.decrement.month:
          this.onPrevClick();
          break;
        case Events.desc.request.increment.month:
          this.onNextClick();
          break;
        default:
          break;
      }
    }
    IncrementSlider.prototype.notify.call(this, e);
  };

  return MonthIncrementSlider;
})();
