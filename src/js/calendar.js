var Calendar =
(function(){

  function Calendar(options, scale){
    //Upper/Lower bounds to date value
    this.max_date = options.max_date;
    this.min_date = options.min_date;
    this.lang = (options.lang !== undefined && ['en','fr'].indexOf(options.lang) !== -1) ? options.lang : 'en';

    //Date that is modified by the user
    this.date = new Date(options.date.getUTCFullYear(), options.date.getUTCMonth(), options.date.getUTCDate());

    //Date used for applying ui changes
    this.uidate = new Date(options.date.getUTCFullYear(), options.date.getUTCMonth(), options.date.getUTCDate());

    //Saved state in case of rollback
    this.prev_date = new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate());

    //Scale for this instance
    this.scale = scale;

    //Callbacks for UI update
    this.uicallbacks = {};

    //Incremental Input controls
    this.incrementInputs = {};

    //All daily/weekly calendars
    this.calendars = {};

    this.generateHTML();

  }

  //Normally one shouldn't include translations directly into code.
  //However in this case there is so little translations that it doesn't matter.
  Calendar.prototype.months = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    fr: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
  };

  Calendar.prototype.statuses = {
    active: "active",
    inactive: "inactive"
  };

  Calendar.prototype.scales = {
    day : "day",
    week : "week",
    month : "month",
    year : "year"
  };

  Calendar.prototype.inputs = {
    minput: "minput",
    yinput: "yinput",
    ytab: "ytab"
  };

  Calendar.prototype.generateHTML = function(){
    switch(this.scale){
      case Calendar.prototype.scales.day:
        this.html = this.dailyCalendarHTML();
        break;
      case Calendar.prototype.scales.week:
        this.html = this.weeklyCalendarHTML();
        break;
      case Calendar.prototype.scales.month:
        this.html = this.monthlyCalendarHTML();
        break;
      case Calendar.prototype.scales.year:
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
      this.uiApply();
    }
  };

  Calendar.prototype.rollback = function () {
    this.date.setUTCFullYear(this.prev_date.getUTCFullYear());
    this.date.setUTCMonth(this.prev_date.getUTCMonth());
    this.date.setUTCDate(this.prev_date.getUTCDate());
    this.uiApply();
  };

  Calendar.prototype.commit = function () {
    this.prev_date.setUTCFullYear(this.date.getUTCFullYear());
    this.prev_date.setUTCMonth(this.date.getUTCMonth());
    this.prev_date.setUTCDate(this.date.getUTCDate());
  };

  Calendar.prototype.uiApply = function(scale) {
    var val, uuid;
    if(scale === undefined){
      var updateCal = false;
      if(this.uidate.getUTCFullYear() !== this.date.getUTCFullYear()){
        this.uiApply(Calendar.prototype.scales.year);
        updateCal = true;
        this.uidate.setUTCFullYear(this.date.getUTCFullYear());
        this.uidate.setUTCDate(this.date.getUTCDate());
      }
      if(this.uidate.getUTCMonth() !== this.date.getUTCMonth()){
        this.uiApply(Calendar.prototype.scales.month);
        updateCal = true;
        this.uidate.setUTCMonth(this.date.getUTCMonth());
        this.uidate.setUTCDate(this.date.getUTCDate());
      }
      if(this.uidate.getUTCDate() !== this.date.getUTCDate()){
        this.uiApply(Calendar.prototype.scales.day);
        this.uidate.setUTCDate(this.date.getUTCDate());
      }
      if(updateCal){
        this.updateCalendarHTML();
      }
    }else{
      for(uuid in this.uicallbacks[scale]){
        val = this.uicallbacks[scale][uuid];
        if(val.status === Calendar.prototype.statuses.active){
          val.function.call(this);
        }
      }
    }
  };

  Calendar.prototype.uiRegister = function(scale, fn) {
    if(this.uicallbacks[scale] === undefined){
      this.uicallbacks[scale] = {};
    }
    var uuid = generateUUID();
    this.uicallbacks[scale][uuid] = {function: fn, status: Calendar.prototype.statuses.active};
    return uuid;
  };

  Calendar.prototype.uiActivate = function(scale, uuid) {
    if(typeof this.uicallbacks[scale][uuid].function === "function"){
      this.uicallbacks[scale][uuid].status = Calendar.prototype.statuses.active;
    }
  };

  Calendar.prototype.uiDisactivate = function(scale, uuid){
    if(typeof this.uicallbacks[scale][uuid].function === "function"){
      this.uicallbacks[scale][uuid].status = Calendar.prototype.statuses.inactive;
    }
  };

  Calendar.prototype._initCalendarIndex = function () {
    if(this.calendars[this.date.getUTCFullYear()] === undefined){
      this.calendars[this.date.getUTCFullYear()] = {};
    }
    if(this.calendars[this.date.getUTCFullYear()][this.date.getUTCMonth()] === undefined){
      this.calendars[this.date.getUTCFullYear()][this.date.getUTCMonth()] = {};
    }
  };

  Calendar.prototype.getCalendarHTML = function () {
    this._initCalendarIndex();
    var calendar;
    if(this.calendars[this.date.getUTCFullYear()][this.date.getUTCMonth()][this.scale] !== undefined){
      calendar = this.calendars[this.date.getUTCFullYear()][this.date.getUTCMonth()][this.scale];
      return calendar;
    }else{
      calendar = this.calendarHTML();
      this.calendars[this.date.getUTCFullYear()][this.date.getUTCMonth()][this.scale] = calendar;
      return calendar;
    }
  };

  Calendar.prototype.updateCalendarHTML = function () {
    var oldc, newc;
    for (var i = 0; i < this.html.children[0].children.length; i++) {
      if (this.html.children[0].children[i].className == "date-picker-month-calendar") {
        oldc = this.html.children[0].children[i];
        newc = this.getCalendarHTML();
        if(!(oldc.cdata.year === newc.cdata.year && oldc.cdata.month === newc.cdata.month)){
          this.html.children[0].removeChild(oldc);
          this.html.children[0].appendChild(newc);
          this.uiActivate(Calendar.prototype.scales.day, newc.callbackUUID);
          this.uiDisactivate(Calendar.prototype.scales.day, oldc.callbackUUID);
          this.uiApply(Calendar.prototype.scales.day);
        }
        break;
      }
    }
  };

  Calendar.prototype.getIncrementInput = function (input) {
    if(this.incrementInputs[input] === undefined){
      switch(input){
        case Calendar.prototype.inputs.yinput:
          this.incrementInputs[input] = this.yearInputHTML();
          break;
        case Calendar.prototype.inputs.minput:
          this.incrementInputs[input] = this.monthInputHTML();
          break;
        case Calendar.prototype.inputs.ytab:
          this.incrementInputs[input] = this.yearTabHTML();
          break;
        default:
          return undefined;
      }
    }
    return this.incrementInputs[input];
  };

  Calendar.prototype.dailyCalendarHTML = function () {
    var container = document.createElement('div'),
        wrapper = document.createElement('div'),
        yinput = this.getIncrementInput(Calendar.prototype.inputs.yinput),
        minput = this.getIncrementInput(Calendar.prototype.inputs.minput);
    container.className = "date-picker-mode-day active";
    wrapper.className = "date-picker-content-wrapper";
    wrapper.appendChild(yinput);
    wrapper.appendChild(minput);
    wrapper.appendChild(this.getCalendarHTML());
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
    yinput.callbackUUID =
      this.uiRegister(Calendar.prototype.scales.year, function(){
        yinput.children[0].innerHTML = self.date.getUTCFullYear();
      });

    var yprev = yinput.children[1].children[0];
    yprev.callbackUUID =
      this.uiRegister(Calendar.prototype.scales.year, function(){
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
    yprev.addEventListener('click', function(e){
      yprevClickCallback(self, e.target);
    });

    var ynext = yinput.children[1].children[1];
    ynext.callbackUUID =
      this.uiRegister(Calendar.prototype.scales.year, function(){
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
    ynext.addEventListener('click', function(e){
      ynextClickCallback(self, e.target);
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
    minput.callbackUUID =
      this.uiRegister(Calendar.prototype.scales.month, function(){
        minput.children[0].innerHTML = self.months[self.lang][self.date.getUTCMonth()];
      });

    var mprev = minput.children[1].children[0];
    mprev.callbackUUID =
      this.uiRegister(Calendar.prototype.scales.month, function(){
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

    mprev.addEventListener('click', function(e){
      mprevClickCallback(self, e.target);
    });

    var mnext = minput.children[1].children[1];
    mnext.callbackUUID =
      this.uiRegister(Calendar.prototype.scales.month, function(){
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

    mnext.addEventListener('click', function(e){
      mnextClickCallback(self, e.target);
    });

    return minput;
  };

  Calendar.prototype.calendarHTML = function () {
    var self = this,
        calendar = document.createElement('div'),
        daysInMonth = DateUtils.daysInMonth(this.date.getUTCFullYear(), this.date.getUTCMonth()),
        daysInPrevMonth = DateUtils.daysInMonth(this.date.getUTCFullYear(), this.date.getUTCMonth()-1),
        firstDayOfMonth = DateUtils.firstOfMonth(this.date),
        callback = function(e){
            daySpanClickCallback(self, calendar, e.target);
        };
    calendar.className = "date-picker-month-calendar";
    var row, span, spans = [], day = 1;
    //Going through weeks
    for(var i = 0 ; i < 6 ; i++){
      //Creating week
      row = document.createElement('div');
      row.className = "date-picker-week-row";
      var j = 0;
      if(i === 0){
        //First week potentially has days from another month.
        for(; j < firstDayOfMonth ; j++){
          span = document.createElement('span');
          span.className = "date-picker-day-cell disabled";
          span.innerHTML = daysInPrevMonth - (firstDayOfMonth - j);
          span.cdata = {
            selectable: false,
            day: daysInPrevMonth - (firstDayOfMonth - j),
            month: self.date.getUTCMonth()-1
          };
          row.appendChild(span);
          spans.push(span);
        }
      }
      //Starting at j = x where x is either 0 if past first week or x is firstDayOfMonth
      for(; j < 7 ; j++){
        span = document.createElement('span');
        span.cdata = {
          selectable: day <= daysInMonth,
          //Takes in account days of next month
          day: day > daysInMonth ? day - daysInMonth : day,
          month: day > daysInMonth ? this.date.getUTCMonth()+1 : this.date.getUTCMonth()
        };
        //If greater than daysInMonth, the date is in next month and should be disabled.
        if(day > daysInMonth){
          span.className = "date-picker-day-cell disabled";
        }else if(span.cdata.day === self.date.getUTCDate()){
          span.className = "date-picker-day-cell active";
          calendar.current = span;
        }else{
          span.className = "date-picker-day-cell";
        }
        span.innerHTML = span.cdata.day;
        span.addEventListener('click', callback);
        row.appendChild(span);
        spans.push(span);
        day++;
      }
      calendar.appendChild(row);
    }
    calendar.cdata = {
      year: self.date.getUTCFullYear(),
      month: self.date.getUTCMonth()
    };
    calendar.callbackUUID =
      this.uiRegister(Calendar.prototype.scales.day, function(){
        calendar.current.className = "date-picker-day-cell";
        for(var i = 0 ; i < spans.length; i++){
          if(self.date.getUTCDate() === spans[i].cdata.day && self.date.getUTCMonth() === spans[i].cdata.month){
            calendar.current = spans[i];
            calendar.current.className = "date-picker-day-cell active";
            break;
          }
        }
      });

    return calendar;
  };

  var yprevClickCallback = function(self, button){
    if(button.isDisabled === true){
      return;
    }
    var year = self.date.getUTCFullYear() - 1,
        daysInMonth = DateUtils.daysInMonth(self.date.getUTCFullYear() - 1, self.date.getUTCMonth()),
        uiday = false, uimonth = false, uiyear = false;
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
      self.uiApply();
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
      self.uiApply();
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
      self.uiApply();
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
      self.uiApply();
    }
  };

  var daySpanClickCallback = function(self, calendar, span){
    var daysInMonth = DateUtils.daysInMonth(self.date.getUTCFullYear(), self.date.getUTCMonth());
    if(span.cdata.selectable === true && span.cdata.day <= daysInMonth && span.cdata.day > 0){
      self.date.setUTCDate(span.cdata.day);
      self.uiApply(Calendar.prototype.scales.day);
    }
  };

  //Source
  //http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
  var generateUUID = function(){
    var lut = []; for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }
    var d0 = Math.random()*0xffffffff|0;
    var d1 = Math.random()*0xffffffff|0;
    var d2 = Math.random()*0xffffffff|0;
    var d3 = Math.random()*0xffffffff|0;
    return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+
      lut[d1&0xff]+lut[d1>>8&0xff]+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+
      lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
      lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
  };

  var DateUtils = {
    isLeapYear: function(year){
      return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
    },
    daysInMonth: function(year, month){
      return [31, (this.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    },
    weeksInMonth: function(year, month){
      var weeks = month == 2 ? ((this.isLeapYear(year)) ? 5 : 4) : 5;
      return this.firstOfMonth(new Date(year,month, 1)) > 4 ? weeks + 1 : weeks;
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
