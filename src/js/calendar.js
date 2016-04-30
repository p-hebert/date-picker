var Calendar =
(function(){

  function Calendar(options, scale){
    //Upper/Lower bounds to date value
    this.max_date = options.max_date;
    this.min_date = options.min_date;
    this.lang = (options.lang !== undefined && ['en','fr'].indexOf(options.lang) !== -1) ? options.lang : 'en';

    //Date that is modified by the user
    this.date = new Date(options.date.getUTCFullYear(), options.date.getUTCMonth(), options.date.getUTCDate());

    //Saved state in case of rollback
    this.prev_date = new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate());

    //Scale for this implementation
    this.scale = scale;

    //UI Components to watch
    this.uicomponents = {};

    this.generateHTML();

  }

  //Normally one shouldn't include translations directly into code.
  //However in this case there is so little translations that it doesn't matter.
  Calendar.prototype.months = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    fr: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
  };

  Calendar.prototype.generateHTML = function(){
    switch(this.scale){
      case "day":
        this.html = this.dailyCalendarHTML();
        break;
      case "week":
        this.html = this.weeklyCalendarHTML();
        break;
      case "month":
        this.html = this.monthlyCalendarHTML();
        break;
      case "year":
        this.html = this.yearlyCalendarHTML();
        break;
      default:
        break;
    }
  };

  Calendar.prototype.getHTML = function(){
    return this.html;
  };

  Calendar.prototype.getDate = function () {
    return this.prev_date;
  };

  Calendar.prototype.setDate = function (date) {
    if(date instanceof Date && (this.min_date !== undefined || date > this.min_date) && (this.max_date !== undefined || date < this.max_date)){
      this.date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      this.uiapply();
    }
  };

  Calendar.prototype.rollback = function () {
    this.date.setUTCFullYear(this.prev_date.getUTCFullYear());
    this.date.setUTCMonth(this.prev_date.getUTCMonth());
    this.date.setUTCDate(this.prev_date.getUTCDate());
    this.uiapply();
  };

  Calendar.prototype.commit = function () {
    this.prev_date.setUTCFullYear(this.date.getUTCFullYear());
    this.prev_date.setUTCMonth(this.date.getUTCMonth());
    this.prev_date.setUTCDate(this.date.getUTCDate());
  };

  Calendar.prototype.uiapply = function(scale) {
    if(scale === undefined){
      for(var s in this.uicomponents){
        for(var i = 0 ; i < this.uicomponents[s].length ; i++){
          this.uicomponents[s][i].call(this);
        }
      }
    }else{
      for(var j = 0 ; j < this.uicomponents[scale] ; j++){
        this.uicomponents[scale][j].call(this);
      }
    }

  };

  Calendar.prototype.uiregister = function(scale, fn) {
    if(this.uicomponents[scale] === undefined){
      this.uicomponents[scale] = [];
    }
    this.uicomponents[scale].push(fn);
  };


  Calendar.prototype.dailyCalendarHTML = function () {
    var container = document.createElement('div'),
        wrapper = document.createElement('div'),
        inc_input = [this.yearInputHTML(), this.monthInputHTML()],
        rows = [];
    container.className = "date-picker-mode-day active";
    wrapper.className = "date-picker-content-wrapper";
    wrapper.appendChild(inc_input[0]);
    wrapper.appendChild(inc_input[1]);
    container.appendChild(wrapper);
    return container;
  };

  Calendar.prototype.weeklyCalendarHTML = function () {

  };

  Calendar.prototype.monthlyCalendarHTML = function () {

  };

  Calendar.prototype.yearlyCalendarHTML = function () {

  };

  Calendar.prototype.yearInputHTML = function () {
    var self = this;
    var inner =
      '<span class="increment-input-value"></span>' +
      '<nav>' +
        '<svg class="increment-input-button prev"><use xlink:href="#arrow-prev-small"></svg>' +
        '<svg class="increment-input-button next"><use xlink:href="#arrow-next-small"></svg>' +
      '</nav>';

    var yinput = document.createElement('div');
    yinput.className = "increment-input";
    yinput.innerHTML = inner;
    yinput.children[0].innerHTML = this.date.getUTCFullYear();
    this.uiregister("year", function(){
      yinput.children[0].innerHTML = self.date.getUTCFullYear();
    });

    var yprev = yinput.children[1].children[0];
    this.uiregister("year", function(){
      //Hiding previous button if at the min value
      if(self.min_date !== undefined && self.min_date.getUTCFullYear() === self.date.getUTCFullYear()){
        yprev.setAttribute("class", "increment-input-button prev disabled");
        yprev.isDisabled = true;
      //Else making sure button is visible
      }else{
        yprev.setAttribute("class", "increment-input-button prev");
        yprev.isDisabled = false;
      }
    });
    yprev.addEventListener('click', function(){
      yprevClickCallback(self, yprev);
    });

    var ynext = yinput.children[1].children[1];
    this.uiregister("year", function(){
      //Hiding next button if at the max value
      if(self.max_date !== undefined && self.max_date.getUTCFullYear() === self.date.getUTCFullYear()){
        ynext.setAttribute("class", "increment-input-button next disabled");
        ynext.isDisabled = true;
      //Else making sure button is visible
      }else{
        ynext.setAttribute("class", "increment-input-button next");
        ynext.isDisabled = false;
      }
    });
    ynext.addEventListener('click', function(){
      ynextClickCallback(self, ynext);
    });

    return yinput;
  };

  Calendar.prototype.monthInputHTML = function () {
    var self = this;
    var inner =
      '<span class="increment-input-value"></span>' +
      '<nav>' +
        '<svg class="increment-input-button prev"><use xlink:href="#arrow-prev-small"></svg>' +
        '<svg class="increment-input-button next"><use xlink:href="#arrow-next-small"></svg>' +
      '</nav>';

    var minput = document.createElement('div');
    minput.className = "increment-input";
    minput.innerHTML = inner;
    minput.children[0].innerHTML = this.months[this.lang][this.date.getUTCMonth()];
    this.uiregister("month", function(){
      minput.children[0].innerHTML = self.months[self.lang][self.date.getUTCMonth()];
    });

    var mprev = minput.children[1].children[0];
    this.uiregister("month", function(){
      //Hiding previous button if at the min value
      if(self.min_date !== undefined &&
        self.min_date.getUTCFullYear() === self.date.getUTCFullYear() && self.min_date.getUTCMonth() === self.date.getUTCMonth()){
        mprev.setAttribute("class", "increment-input-button prev disabled");
        mprev.isDisabled = true;
      //Else making sure button is visible
      }else if(self.max_date !== undefined){
        mprev.setAttribute("class", "increment-input-button prev");
        mprev.isDisabled = false;
      }
    });

    mprev.addEventListener('click', function(){
      mprevClickCallback(self, mprev);
    });

    var mnext = minput.children[1].children[1];
    this.uiregister("month", function(){
      //Hiding next button if at the max value
      if(self.max_date !== undefined &&
        self.max_date.getUTCFullYear() === self.date.getUTCFullYear() && self.max_date.getUTCMonth() === self.date.getUTCMonth()){
        mnext.setAttribute("class", "increment-input-button next disabled");
        mnext.isDisabled = true;
      //Else making sure button is visible
    }else if(self.max_date !== undefined){
        mnext.setAttribute("class","increment-input-button next");
        mnext.isDisabled = false;
      }
    });

    mnext.addEventListener('click', function(){
      mnextClickCallback(self, mnext);
    });

    return minput;
  };

  Calendar.prototype.rowsHTML = function (scale) {
    var rows = [],
        daysInMonth = DateUtils.daysInMonth(this.date.getUTCFullYear(), this.date.getUTCMonth()),
        daysInPrevMonth = DateUtils.daysInMonth(this.date.getUTCFullYear(), this.date.getUTCMonth()-1),
        firstDayOfMonth = DateUtils.firstOfMonth(this.date);

  };

  /*<div class="date-picker-mode-day active">
    <div class="date-picker-content-wrapper">
      <div class="increment-input">
        <span class="increment-input-value">2016</span>
        <nav>
          <svg class="increment-input-button prev"><use xlink:href="#arrow-prev-small"></svg>
          <svg class="increment-input-button next"><use xlink:href="#arrow-next-small"></svg>
        </nav>
      </div>
      <div class="increment-input">
        <span class="increment-input-value">March</span>
        <nav>
          <svg class="increment-input-button prev"><use xlink:href="#arrow-prev-small"></svg>
          <svg class="increment-input-button next"><use xlink:href="#arrow-next-small"></svg>
        </nav>
      </div>
      <div class="date-picker-week-row">
        <span class="date-picker-day-cell disabled">28</span>
        <span class="date-picker-day-cell disabled">29</span>
        <span class="date-picker-day-cell">1</span>
        <span class="date-picker-day-cell">2</span>
        <span class="date-picker-day-cell">3</span>
        <span class="date-picker-day-cell">4</span>
        <span class="date-picker-day-cell">5</span>
      </div>
      <div class="date-picker-week-row">
        <span class="date-picker-day-cell active">6</span>
        <span class="date-picker-day-cell">7</span>
        <span class="date-picker-day-cell">8</span>
        <span class="date-picker-day-cell">9</span>
        <span class="date-picker-day-cell">10</span>
        <span class="date-picker-day-cell">11</span>
        <span class="date-picker-day-cell">12</span>
      </div>
      <div class="date-picker-week-row">
        <span class="date-picker-day-cell">13</span>
        <span class="date-picker-day-cell">14</span>
        <span class="date-picker-day-cell">15</span>
        <span class="date-picker-day-cell">16</span>
        <span class="date-picker-day-cell">17</span>
        <span class="date-picker-day-cell">18</span>
        <span class="date-picker-day-cell">19</span>
      </div>
      <div class="date-picker-week-row">
        <span class="date-picker-day-cell">20</span>
        <span class="date-picker-day-cell">21</span>
        <span class="date-picker-day-cell">22</span>
        <span class="date-picker-day-cell">23</span>
        <span class="date-picker-day-cell">24</span>
        <span class="date-picker-day-cell">25</span>
        <span class="date-picker-day-cell">26</span>
      </div>
      <div class="date-picker-week-row">
        <span class="date-picker-day-cell">27</span>
        <span class="date-picker-day-cell">28</span>
        <span class="date-picker-day-cell">29</span>
        <span class="date-picker-day-cell">30</span>
        <span class="date-picker-day-cell disabled">1</span>
        <span class="date-picker-day-cell disabled">2</span>
        <span class="date-picker-day-cell disabled">3</span>
      </div>
    </div>
  </div>*/

  var yprevClickCallback = function(self, button){
    if(button.isDisabled === true){
      return;
    }
    var year = self.date.getUTCFullYear() - 1,
        daysInMonth = DateUtils.daysInMonth(self.date.getUTCFullYear() - 1, self.date.getUTCMonth());
    //Checks if action is legal (not going below min year)
    if(self.min_date === undefined || self.min_date.getUTCFullYear() <= year){
      //To prevent invalid dates like Feb 30th
      if(self.date.getUTCDate() > daysInMonth){
        self.date.setUTCDate(daysInMonth);
      }

      self.date.setUTCFullYear(year);
      //Making sure that we are not going below the min date on the smaller scales than year
      if(self.min_date !== undefined && self.min_date.getUTCFullYear() === self.date.getUTCFullYear()){
        if(self.min_date.getUTCMonth() > self.date.getUTCMonth()){
          self.date.setUTCMonth(self.min_date.getUTCMonth());
          self.date.setUTCDate(self.min_date.getUTCDate());
        }else if(self.min_date.getUTCDay() > self.date.getUTCDate() && self.min_date.getUTCMonth() === self.date.getUTCMonth()){
          self.date.setUTCDate(self.min_date.getUTCDate());
        }
      }
      self.uiapply();
    }
    //else do nothing
  };

  var ynextClickCallback = function(self, button){
    if(button.isDisabled === true){
      return;
    }
    var year = self.date.getUTCFullYear() + 1,
        daysInMonth = DateUtils.daysInMonth(self.date.getUTCFullYear() + 1, self.date.getUTCMonth());
    //Checks if action is legal (not going below min year)
    if(self.max_date === undefined || self.max_date.getUTCFullYear() >= year){

      //To prevent invalid dates like Feb 30th
      if(self.date.getUTCDate() > daysInMonth){
        self.date.setUTCDate(daysInMonth);
      }

      self.date.setUTCFullYear(year);

      //Making sure that we are not going above the max date on the smaller scales than year
      if(self.max_date !== undefined && self.max_date.getUTCFullYear() === year){
        if(self.max_date.getUTCMonth() < self.date.getUTCMonth()){
          self.date.setUTCMonth(self.max_date.getUTCMonth());
          self.date.setUTCDate(self.max_date.getUTCDate());
        }else if(self.max_date !== undefined && self.max_date.getUTCDay() > self.date.getUTCDate() && self.min_date.getUTCMonth() === self.date.getUTCMonth()){
          self.date.setUTCDate(self.max_date.getUTCDate());
        }
      }
      self.uiapply();
    }
    //else do nothing
  };

  var mprevClickCallback = function(self, button){
    if(button.isDisabled === true){
      return;
    }
    var year = self.date.getUTCFullYear(),
        month = NumberUtils.mod(self.date.getUTCMonth() - 1, 12),
        daysInMonth = month !== 11 ?
                      DateUtils.daysInMonth(self.date.getUTCFullYear(), month):
                      DateUtils.daysInMonth(self.date.getUTCFullYear() -1, month),
        apply = false,
        applyDateChange = function(){
          //To prevent invalid dates like Feb 30th
          //Takes in account change of year
          if(self.date.getUTCDate() > daysInMonth){
            self.date.setUTCDate(daysInMonth);
          }
          self.date.setUTCMonth(month);
        };
    //If no min_date, no constraints.
    if(self.min_date === undefined || self.min_date.getUTCFullYear() < year-1){
      apply = true;
      applyDateChange();
      if(month === 11){
        self.date.setUTCFullYear(year - 1);
      }
    //If min year is = to year, must check for month and day.
    }else if(self.min_date.getUTCFullYear() === year && month !== 11){
      //Check if action is valid
      if(self.min_date.getUTCMonth() < month || self.min_date.getUTCMonth() === month){
        apply = true;
        applyDateChange();
      }
      //Granted min month = month
      //Resets the day if conflict between min day and currently selected day
      if(self.min_date.getUTCMonth() === month && self.min_date.getUTCDay() > self.date.getUTCDay()){
        self.date.setUTCDate(self.min_date.getUTCDate());
      }

    }else if(self.min_date.getUTCFullYear() === year - 1 && month === 11){
      if(self.min_date.getUTCMonth() < month || self.min_date.getUTCMonth() === month){
        apply = true;
        applyDateChange();
        self.date.setUTCFullYear(year - 1);
      }

      if(self.min_date.getUTCMonth() === month && self.min_date.getUTCDay() > self.date.getUTCDay()){
        self.date.setUTCDate(self.min_date.getUTCDate());
      }

    }else if(self.min_date.getUTCFullYear() === year - 1 && month !== 11){
      apply = true;
      applyDateChange();
    }else{
    }

    if(apply){
      self.uiapply();
    }
  };

  var mnextClickCallback = function(self, button){
    if(button.isDisabled === true){
      return;
    }
    var year = self.date.getUTCFullYear(),
        month = NumberUtils.mod(self.date.getUTCMonth() + 1, 12),
        daysInMonth = month !== 0 ?
                      DateUtils.daysInMonth(self.date.getUTCFullYear(), month):
                      DateUtils.daysInMonth(self.date.getUTCFullYear() + 1, month),
        apply = false,
        applyDateChange = function(){
          //To prevent invalid dates like Feb 30th
          //Takes in account change of year
          if(self.date.getUTCDate() > daysInMonth){
            self.date.setUTCDate(daysInMonth);
          }
          self.date.setUTCMonth(month);
        };
    // console.log('* self.date.getUTCMonth(): ' + self.date.getUTCMonth());
    // console.log('* self.date.getUTCFullYear(): ' + self.date.getUTCFullYear());
    // console.log('* self.max_date.getUTCMonth(): ' + self.max_date.getUTCMonth());
    // console.log('* self.max_date.getUTCFullYear(): ' + self.max_date.getUTCFullYear());
    // console.log('* month: ' + month);
    // console.log('* year: ' + year);
    //If no max_date, no constraints.
    if(self.max_date === undefined || self.max_date.getUTCFullYear() > year+1){
      apply = true;
      applyDateChange();
      if(month === 0){
        self.date.setUTCFullYear(year + 1);
      }
    //If max year is = to year, must check for month and day.
    }else if(self.max_date.getUTCFullYear() === year && month !== 0){
      //Check if action is valid
      if(self.max_date.getUTCMonth() > month || self.max_date.getUTCMonth() === month){
        apply = true;
        applyDateChange();
      }
      //Granted max month = month
      //Resets the day if conflict between max day and currently selected day
      if(self.max_date.getUTCMonth() === month && self.max_date.getUTCDay() < self.date.getUTCDay()){
        self.date.setUTCDate(self.max_date.getUTCDate());
      }

    }else if(self.max_date.getUTCFullYear() === year + 1 && month === 0){
      if(self.max_date.getUTCMonth() > month || self.max_date.getUTCMonth() === month){
        apply = true;
        applyDateChange();
        self.date.setUTCFullYear(year + 1);
      }

      if(self.max_date.getUTCMonth() === month && self.max_date.getUTCDay() < self.date.getUTCDay()){
        self.date.setUTCDate(self.max_date.getUTCDate());
      }

    }else if(self.max_date.getUTCFullYear() === year + 1 && month !== 0){
      apply = true;
      applyDateChange();
    }else{
    }

    if(apply){
      self.uiapply();
    }
  };

  var DateUtils = {
    isLeapYear: function(year){
      return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
    },
    daysInMonth: function(year, month){
      return [31, (this.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    },
    firstOfMonth: function(date){
      return new Date(date.getUTCFullYear(), date.getUTCMonth(), 1).getDay();
    }
  };

  var NumberUtils = {
    mod: function(n, m) {
      return ((n % m) + m) % m;
    }
  };

  return Calendar;
})();
