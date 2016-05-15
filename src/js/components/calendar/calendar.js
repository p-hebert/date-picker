var Calendar =
(function(){

  function Calendar(options, component){
    //super()
    component = component === undefined? Calendar.prototype.component : component;
    Colleague.call(this, options.mediator, component);
    this.mediation.events.emit.cupdate = this._constructEventString(Events.scope.emit, Events.desc.update.cal);

    //Upper/Lower bounds to date value
    this.min_date = options.min_date instanceof Date ?
                    new Date(options.min_date.getUTCFullYear(), options.min_date.getUTCMonth(), options.min_date.getUTCDate()) :
                    undefined;
    this.max_date = options.max_date instanceof Date && options.max_date > this.min_date?
                    new Date(options.max_date.getUTCFullYear(), options.max_date.getUTCMonth(), options.max_date.getUTCDate()) :
                    undefined;

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

  //Component for Event Strings
  Calendar.prototype.component = 'CALENDAR';

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
        //Default class
        span.className = "date-picker-day-cell";

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
        }
        span.innerHTML = span.cdata.day;
        if(this.scale === Calendar.prototype.enum.scales.day){
          span.addEventListener('click', callback);
        }
        row.appendChild(span);
        spans.push(span);
        day++;
      }
      row.cdata = {
        inMonth: self._rowInMonth(row),
        start: new Date(
                          self.date.getUTCFullYear(),
                          row.children[0].cdata.month,
                          row.children[0].cdata.day
                       ),
        end:   new Date(
                          this.date.getUTCFullYear(),
                          row.children[6].cdata.month,
                          row.children[6].cdata.day
                       ),
      };
      rows.push(row);
      calendar.appendChild(row);
    }
    calendar.cdata = {
      year: this.date.getUTCFullYear(),
      month: this.date.getUTCMonth()
    };
    return calendar;
  };

  Calendar.prototype._rowInMonth = function (row) {
    for(var i = 0 ; i < row.children.length; i++){
      if(row.children[i].className.indexOf("disabled") === -1){
        return true;
      }
    }
    return false;
  };

  Calendar.prototype.updateSelection = function (span) {
    console.log("Update Selection Method, argument:");
    console.log(span);
    var calendar = this.html,
        day = this.date.getUTCDate(),
        month = this.date.getUTCMonth();
        console.log("Current cdata before change:");
        console.log(calendar.current.cdata);
    if(calendar.current.cdata.day !== day){
      this.removeSelection();
      if(span === undefined){
        for (var i = 0; i < this.html.children.length; i++) {
          for (var j = 0; j < this.html.children[i].children.length; j++) {
            if(this.html.children[i].children[j].cdata.day === day && this.html.children[i].children[j].cdata.month === month){
              this.newSelection(this.html.children[i].children[j]);
            }
          }
        }
      }else{
        this.newSelection(span);
      }
    }else console.log("Same day");
  };

  Calendar.prototype.newSelection = function (span) {
    console.log("{scale = "+ this.scale + "} : New Selection Method, argument:");
    console.log(span);
    if(span.cdata.day === this.date.getUTCDate()){
      this.html.current = span;
      if(this.scale === Calendar.prototype.enum.scales.day){
        this.html.current.className = "date-picker-day-cell active";
      }else if (this.scale === Calendar.prototype.enum.scales.week){
        console.log("New selection {scale = week}:");
        console.log(this.html.current.parentNode.cdata);
        this.html.current.parentNode.className = "date-picker-week-row active";
      }
    }
  };

  Calendar.prototype.removeSelection = function () {
    console.log("Remove Selection Method");
    if(this.scale === Calendar.prototype.enum.scales.day){
      this.html.current.className = "date-picker-day-cell";
    }else if (this.scale === Calendar.prototype.enum.scales.week){
      console.log("Removing previous selection {scale = week}:");
      console.log(this.html.current.parentNode.cdata);
      this.html.current.parentNode.className = "date-picker-week-row";
    }
  };

  Calendar.prototype.onRowClick = function (target) {
    if(target.className.indexOf("date-picker-day-cell") !== -1){
      target = target.parentNode;
    }
    if(target.cdata.inMonth === true){
      this.date.setUTCDate(target.cdata.start.getUTCDate());
      console.log("Row click: new date: " + this.date);
      console.log("Row is inMonth");
      this.emit(this.mediation.events.emit.cupdate, {date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate())});
      this.updateSelection(target.children[0]);
    }
  };

  Calendar.prototype.onSpanClick = function (span) {
    var daysInMonth = DateUtils.daysInMonth(this.date.getUTCFullYear(), this.date.getUTCMonth());
    if(span.cdata.selectable === true && span.cdata.day <= daysInMonth && span.cdata.day > 0){
      this.date.setUTCDate(span.cdata.day);
      this.emit(this.mediation.events.emit.cupdate, {date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate())});
      this.updateSelection(span);
    }
  };

  Calendar.prototype.subscribe = function (parent) {
    if(parent !== undefined){
      this.mediator.subscribe(this.mediation.events.emit.cupdate, parent);
    }
  };

  Calendar.prototype.notify = function (e) {
    console.log("Calendar.proto.notify:");
    console.log(e);
    if(e.scope === Events.scope.broadcast){
      switch(e.desc){
        case Events.desc.update.partial:
          if(e.data.min_date !== undefined && e.data.date instanceof Date){
            this.min_date = new Date(e.data.min_date.getUTCFullYear(), e.data.min_date.getUTCMonth(), e.data.min_date.getUTCDate());
          }
          if(e.data.max_date !== undefined && e.data.date instanceof Date){
            this.max_date = new Date(e.data.max_date.getUTCFullYear(), e.data.max_date.getUTCMonth(), e.data.max_date.getUTCDate());
          }
        case Events.desc.update.cal:
          if(e.data.date !== undefined && e.data.date instanceof Date){
            console.log("New Date:" + e.data.date);
            this.setDate(e.data.date);
          }
          this.updateCalendarHTML();
          break;
        default:
          break;
      }
    }
    this.constructor.prototype.notify.call(this, e);
  };

  return Calendar;
})();
