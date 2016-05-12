var YearIncrementSlider = (function(){
  function YearIncrementSlider(options){
    //super()
    IncrementSlider.call(this, options);
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

  /**
  * @override
  **/
  YearIncrementSlider.prototype.setValue = function(value){
    this.date = new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
    this.value = this.date;
    this.setUIValue();
    this.callCallback(IncrementSlider.prototype.enum.valuechange);
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
      this.emit(Events.slaveupdate.yis, {date: this.date});
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
      this.emit(Events.slaveupdate.yis, {date: this.date});
      IncrementSlider.prototype.onNextClick.call(this);
    }
    //else do nothing
  };

  /**
  * @override
  **/
  YearIncrementSlider.prototype.notify = function (e) {
    switch(e.name){
      case Events.masterupdate.yis:
        this.setValue(e.data.date);
        this.updateUIControls();
        break;
      default:
        break;
    }
    Colleague.prototype.notify.call(this, e);
  };

  return YearIncrementSlider;
})();
