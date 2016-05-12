var Calendar =
(function(){

  function Calendar(options){
    //super()
    Colleague.call(this, options.mediator);

    //Upper/Lower bounds to date value
    this.max_date = options.max_date;
    this.min_date = options.min_date;

    //Date that is modified by the user
    this.date = new Date(options.date.getUTCFullYear(), options.date.getUTCMonth(), options.date.getUTCDate());

    //Scale for this instance
    this.scale = (options.scale && Calendar.prototype.enum.scales[options.scale]) ?
                 Calendar.prototype.enum.scales[options.scale] :
                 Calendar.prototype.enum.scales.day;

    this.months = {};
    this.html = this.getCalendarHTML();
  }

  //Binding the prototype of the Parent object
  //Properties will be overriden on this one.
  Calendar.prototype = Object.create(Colleague.prototype);

  //Binding the constructor to the prototype
  Calendar.prototype.constructor = Colleague;

  Calendar.prototype.enum = {
    scales: {
      day : "day",
      week : "week",
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
    }
  };

  Calendar.prototype._initCalendarIndex = function () {
    if(this.months[this.date.getUTCFullYear()] === undefined){
      this.months[this.date.getUTCFullYear()] = {};
    }
  };

  Calendar.prototype.getCalendarHTML = function () {
    this._initCalendarIndex();
    var calendar;
    if(this.months[this.date.getUTCFullYear()][this.date.getUTCMonth()] !== undefined){
      calendar = this.months[this.date.getUTCFullYear()][this.date.getUTCMonth()];
      return calendar;
    }else{
      calendar = this.generateHTML();
      this.months[this.date.getUTCFullYear()][this.date.getUTCMonth()] = calendar;
      return calendar;
    }
  };

  Calendar.prototype.updateCalendarHTML = function () {
    var oldc = this.html,
        parentNode = this.html.parentNode;
    if(!(oldc.cdata.year === this.date.getUTCFullYear() && oldc.cdata.month === this.date.getUTCMonth())){
      parentNode.removeChild(oldc);
      this.html = this.getCalendarHTML();
      parentNode.appendChild(this.html);
      this.updateSelection();
    }
  };

  Calendar.prototype.generateHTML = function () {
    var self = this,
        calendar = document.createElement('div'),
        daysInMonth = DateUtils.daysInMonth(this.date.getUTCFullYear(), this.date.getUTCMonth()),
        daysInPrevMonth = DateUtils.daysInMonth(this.date.getUTCFullYear(), NumberUtils.mod(this.date.getUTCMonth() - 1, 12)),
        firstDayOfMonth = DateUtils.firstOfMonth(this.date),
        callback;
    if(this.scale === Calendar.prototype.enum.scales.day){
      callback = function(e){
          self.onSpanClick(e.target);
      };
    }else if(this.scale === Calendar.prototype.enum.scales.week){
      callback = function(e){
          self.onRowClick(e.target);
      };
    }

    calendar.className = "date-picker-month-calendar";
    var row, span, rows = [], spans = [], day = 1;
    //Going through weeks
    for(var i = 0 ; i < 6 ; i++){
      //Creating week
      row = document.createElement('div');
      row.className = "date-picker-week-row";
      if(this.scale === Calendar.prototype.enum.scales.week){
        row.addEventListener('click', callback);
      }
      row.cdata = {
        inMonth: day < daysInMonth,
        start: new Date(
                          self.date.getUTCFullYear(),
                          this.inMonth ? self.date.getUTCMonth() : self.date.getUTCMonth() + 1,
                          this.inMonth ? day - daysInMonth : day
                       ),
        end:   new Date(
                          this.date.getUTCFullYear(),
                          day + 6 < daysInMonth ? self.date.getUTCMonth() : self.date.getUTCMonth() + 1,
                          day + 6 < daysInMonth ? day + 6 - daysInMonth : day + 6
                       ),
      };
      var j = 0;
      if(i === 0){
        //First week potentially has days from another month.
        for(; j < firstDayOfMonth ; j++){
          span = document.createElement('span');
          span.className = "date-picker-day-cell disabled";
          span.innerHTML = daysInPrevMonth - (firstDayOfMonth - (j+1));
          span.cdata = {
            selectable: false,
            day: daysInPrevMonth - (firstDayOfMonth - j),
            month: this.date.getUTCMonth()-1
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
        }else if(span.cdata.day === this.date.getUTCDate()){
          if(this.scale === Calendar.prototype.enum.scales.day){
            span.className = "date-picker-day-cell active";
            calendar.current = span;
          }else if(span.cdata.day === this.date.getUTCDate() && this.scale === Calendar.prototype.enum.scales.week){
            row.className = "date-picker-week-row active";
            calendar.current = span;
          }
        }else{
          span.className = "date-picker-day-cell";
        }
        span.innerHTML = span.cdata.day;
        if(this.scale === Calendar.prototype.enum.scales.day){
          span.addEventListener('click', callback);
        }
        row.appendChild(span);
        spans.push(span);
        day++;
      }
      rows.push(row);
      calendar.appendChild(row);
    }
    calendar.cdata = {
      year: this.date.getUTCFullYear(),
      month: this.date.getUTCMonth()
    };
    return calendar;
  };

  Calendar.prototype.updateSelection = function (span) {
    var calendar = this.html,
        day = this.date.getUTCDate();
    if(calendar.current.cdata.day !== day){
      this.removeSelection();
      if(span === undefined){
        for (var i = 0; i < this.html.children.length; i++) {
          for (var j = 0; j < this.html.children[i].children.length; j++) {
            if(this.html.children[i].children[j].cdata.day === day){
              this.newSelection(this.html.children[i].children[j]);
            }
          }
        }
      }else{
        this.newSelection(span);
      }

    }
  };

  Calendar.prototype.newSelection = function (span) {
    if(span.cdata.day === this.date.getUTCDate()){
      this.html.current = span;
      if(this.scale === Calendar.prototype.enum.scales.day){
        this.html.current.className = "date-picker-day-cell active";
      }else if (this.scale === Calendar.prototype.enum.scales.week){
        this.html.current.parentNode.className = "date-picker-week-row active";
      }
    }
  };

  Calendar.prototype.removeSelection = function () {
    if(this.scale === Calendar.prototype.enum.scales.day){
      this.html.current.className = "date-picker-day-cell";
    }else if (this.scale === Calendar.prototype.enum.scales.week){
      this.html.current.parentNode.className = "date-picker-week-row";
    }
  };

  Calendar.prototype.onRowClick = function (row) {
    if(row.cdata.inMonth === true){
      this.date.setUTCDate(row.cdata.start.getUTCDate());
      this.emit(Events.slaveupdate.cal, {date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate())});
      this.updateSelection(row.children[0]);
    }
  };

  Calendar.prototype.onSpanClick = function (span) {
    var daysInMonth = DateUtils.daysInMonth(this.date.getUTCFullYear(), this.date.getUTCMonth());
    if(span.cdata.selectable === true && span.cdata.day <= daysInMonth && span.cdata.day > 0){
      this.date.setUTCDate(span.cdata.day);
      this.emit(Events.slaveupdate.cal, {date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate())});
      this.updateSelection(span);
    }
  };

  Calendar.prototype.emit = function (eventStr, data) {
    this.mediator.notify(eventStr, this, data);
  };

  Calendar.prototype.notify = function (e) {
    switch(e.name){
      case Events.masterupdate.cal:
        this.setDate(e.data.date);
        this.updateCalendarHTML();
        break;
      default:
        break;
    }
    this.constructor.prototype.notify.call(this, e);
  };

  return Calendar;
})();
