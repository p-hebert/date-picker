var Calendar =
  (function() {

    function Calendar(options, component) {
      //super()
      component = component === undefined ? Calendar.prototype.component : component;
      Colleague.call(this, options.mediator, component);
      this.mediation.events.emit.commit = this._constructEventString(Events.scope.emit, Events.desc.commit);
      this.mediation.events.emit.cupdate = this._constructEventString(Events.scope.emit, Events.desc.update.cal);

      //Upper/Lower bounds to date value
      this.min_date = options.min_date instanceof Date ?
        new Date(options.min_date.getUTCFullYear(), options.min_date.getUTCMonth(), options.min_date.getUTCDate()) :
        undefined;
      this.max_date = options.max_date instanceof Date && options.max_date > this.min_date ?
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
        day: "day",
        week: "week",
      }
    };


    Calendar.prototype.getHTML = function() {
      return this.html;
    };

    Calendar.prototype.getDate = function() {
      return this.prev_date;
    };

    Calendar.prototype.setDate = function(date) {
      if (date instanceof Date && (this.min_date === undefined || date >= this.min_date) && (this.max_date === undefined || date <= this.max_date)) {
        this.date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      }
    };

    Calendar.prototype._initCalendarIndex = function() {
      if (this.months[this.date.getUTCFullYear()] === undefined) {
        this.months[this.date.getUTCFullYear()] = {};
      }
    };

    Calendar.prototype.getCalendarHTML = function() {
      this._initCalendarIndex();
      var calendar;
      if (this.months[this.date.getUTCFullYear()][this.date.getUTCMonth()] !== undefined) {
        calendar = this.months[this.date.getUTCFullYear()][this.date.getUTCMonth()];
        return calendar;
      } else {
        calendar = this.generateHTML();
        this.months[this.date.getUTCFullYear()][this.date.getUTCMonth()] = calendar;
        return calendar;
      }
    };

    Calendar.prototype.updateCalendarHTML = function() {
      var oldc = this.html,
        parentNode = this.html.parentNode;
      if (!(oldc.cdata.year === this.date.getUTCFullYear() && oldc.cdata.month === this.date.getUTCMonth())) {
        parentNode.removeChild(oldc);
        this.html = this.getCalendarHTML();
        parentNode.appendChild(this.html);
        this.updateSelection();
      }
    };

    Calendar.prototype.generateHTML = function() {
      var self = this,
        calendar = document.createElement('div'),
        daysInMonth = DateUtils.daysInMonth(this.date.getUTCFullYear(), this.date.getUTCMonth()),
        daysInPrevMonth = DateUtils.daysInMonth(this.date.getUTCFullYear(), NumberUtils.mod(this.date.getUTCMonth() - 1, 12)),
        firstDayOfMonth = DateUtils.firstOfMonth(this.date),
        callback;
      if (this.scale === Calendar.prototype.enum.scales.day) {
        callback = function(e) {
          self.onSpanClick(e.target);
        };
      } else if (this.scale === Calendar.prototype.enum.scales.week) {
        callback = function(e) {
          self.onRowClick(e.target);
        };
      }

      calendar.className = "date-picker-month-calendar";
      var row, span, rows = [],
        spans = [],
        day = 1;
      //Going through weeks
      for (var i = 0; i < 6; i++) {
        //Creating week
        row = document.createElement('div');
        row.className = "date-picker-week-row";
        if (this.scale === Calendar.prototype.enum.scales.week) {
          row.addEventListener('click', callback);
        }
        var j = 0;
        if (i === 0) {
          //First week potentially has days from another month.
          for (; j < firstDayOfMonth; j++) {
            span = document.createElement('span');
            span.className = "date-picker-day-cell disabled";
            span.innerHTML = daysInPrevMonth - (firstDayOfMonth - (j + 1));
            span.cdata = {
              selectable: false,
              day: daysInPrevMonth - (firstDayOfMonth - j),
              month: NumberUtils.mod(this.date.getUTCMonth() - 1, 12),
              year: NumberUtils.mod(this.date.getUTCMonth() - 1, 12) === 11 ? this.date.getUTCFullYear() - 1 : this.date.getUTCFullYear()
            };
            row.appendChild(span);
            spans.push(span);
          }
        }
        //Starting at j = x where x is either 0 if past first week or x is firstDayOfMonth
        for (; j < 7; j++) {
          span = document.createElement('span');
          span.cdata = {
            selectable: day <= daysInMonth,
            //Takes in account days of next month
            day: day > daysInMonth ? day - daysInMonth : day,
            month: day > daysInMonth ? NumberUtils.mod(this.date.getUTCMonth() + 1, 12) : this.date.getUTCMonth(),
            year: day > daysInMonth && NumberUtils.mod(this.date.getUTCMonth() + 1, 12) === 0 ?
              this.date.getUTCFullYear() + 1 : this.date.getUTCFullYear()
          };
          //Default class
          span.className = "date-picker-day-cell";

          //If greater than daysInMonth, the date is in next month and should be disabled.
          if (day > daysInMonth) {
            span.className = "date-picker-day-cell disabled";
          } else if (span.cdata.day === this.date.getUTCDate()) {
            if (this.scale === Calendar.prototype.enum.scales.day) {
              span.className = "date-picker-day-cell active";
              calendar.current = span;
            } else if (span.cdata.day === this.date.getUTCDate() && this.scale === Calendar.prototype.enum.scales.week) {
              row.className = "date-picker-week-row active";
              calendar.current = span;
            }
          }
          span.innerHTML = span.cdata.day;
          if (this.scale === Calendar.prototype.enum.scales.day) {
            span.addEventListener('click', callback);
          }
          row.appendChild(span);
          spans.push(span);
          day++;
        }
        row.cdata = {
          start: new Date(
            row.children[0].cdata.year,
            row.children[0].cdata.month,
            row.children[0].cdata.day
          ),
          end: new Date(
            row.children[6].cdata.year,
            row.children[6].cdata.month,
            row.children[6].cdata.day
          ),
        };
        row.cdata.disabled = self._isRowDisabled(row);
        rows.push(row);
        calendar.appendChild(row);
      }
      calendar.cdata = {
        year: this.date.getUTCFullYear(),
        month: this.date.getUTCMonth()
      };
      return calendar;
    };

    Calendar.prototype._isRowDisabled = function(row) {
      if ((this.min_date !== undefined && row.cdata.end < this.min_date) ||
        (this.max_date !== undefined && row.cdata.start > this.max_date)) {
        return true;
      }
      for (var i = 0; i < row.children.length; i++) {
        if (row.children[i].className.indexOf("disabled") === -1) {
          return false;
        }
      }
      return true;
    };

    Calendar.prototype.updateSelection = function(span) {
      var calendar = this.html;
      this.removeSelection();
      if (span === undefined) {
        for (var i = 0; i < this.html.children.length; i++) {
          for (var j = 0; j < this.html.children[i].children.length; j++) {
            this.applyClass(this.html.children[i].children[j]);
          }
          this.html.children[i].cdata.disabled = this._isRowDisabled(this.html.children[i]);
        }
      } else {
        this.newSelection(span);
      }
    };

    Calendar.prototype.applyClass = function(span) {
      var span_date = new Date(span.cdata.year, span.cdata.month, span.cdata.day);
      span.className = "date-picker-day-cell disabled";
      if ((this.min_date !== undefined && span_date < this.min_date) ||
        (this.max_date !== undefined && span_date > this.max_date)) {
        span.className = "date-picker-day-cell disabled";
      } else if (span.cdata.day === this.date.getUTCDate() && span.cdata.month === this.date.getUTCMonth()) {
        this.newSelection(span);
      } else if (span.cdata.month == this.date.getUTCMonth()) {
        span.className = "date-picker-day-cell";
      }
    };

    Calendar.prototype.newSelection = function(span) {
      if (span.cdata.day === this.date.getUTCDate()) {
        this.html.current = span;
        if (this.scale === Calendar.prototype.enum.scales.day) {
          this.html.current.className = "date-picker-day-cell active";
        } else if (this.scale === Calendar.prototype.enum.scales.week) {
          this.html.current.parentNode.className = "date-picker-week-row active";
        }
      }
    };

    Calendar.prototype.removeSelection = function() {
      if (this.scale === Calendar.prototype.enum.scales.day) {
        this.html.current.className = "date-picker-day-cell";
      } else if (this.scale === Calendar.prototype.enum.scales.week) {
        this.html.current.parentNode.className = "date-picker-week-row";
      }
    };

    Calendar.prototype.onRowClick = function(target) {
      if (target.className.indexOf("date-picker-day-cell") !== -1) {
        target = target.parentNode;
      }
      if (target.cdata.disabled === false) {
        this.date.setUTCDate(target.cdata.start.getUTCDate());
        this.emit(this.mediation.events.emit.cupdate, { date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate()) });
        this.updateSelection(target.children[0]);
      }
    };

    Calendar.prototype.onSpanClick = function(span) {
      var daysInMonth = DateUtils.daysInMonth(this.date.getUTCFullYear(), this.date.getUTCMonth());
      if (span.cdata.selectable === true && span.cdata.day <= daysInMonth && span.cdata.day > 0) {
        this.date.setUTCDate(span.cdata.day);
        this.emit(this.mediation.events.emit.cupdate, { date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate()) });
        this.updateSelection(span);
      }
    };

    Calendar.prototype.subscribe = function(parent) {
      if (parent !== undefined) {
        this.mediator.subscribe(this.mediation.events.emit.cupdate, parent);
        this.mediator.subscribe(this.mediation.events.emit.commit, parent);
      }
    };

    Calendar.prototype.notify = function(e) {

      if (e.scope === Events.scope.broadcast) {
        switch (e.desc) {
          case Events.desc.update.partial:
            if (e.data.min_date !== undefined && e.data.min_date instanceof Date &&
              (this.max_date === undefined || e.data.min_date < this.max_date)) {
              this.min_date = new Date(e.data.min_date.getUTCFullYear(), e.data.min_date.getUTCMonth(), e.data.min_date.getUTCDate());
              if (this.date < this.min_date) {
                this.setDate(this.min_date);
                this.emit(this.mediation.events.emit.cupdate, { date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate()) });
              }
            }
            if (e.data.max_date !== undefined && e.data.max_date instanceof Date &&
              (this.min_date === undefined || e.data.max_date > this.min_date)) {
              this.max_date = new Date(e.data.max_date.getUTCFullYear(), e.data.max_date.getUTCMonth(), e.data.max_date.getUTCDate());
              if (this.date > this.max_date) {
                this.setDate(this.max_date);
                this.emit(this.mediation.events.emit.cupdate, { date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate()) });
              }
            }
          case Events.desc.update.cal:
            if (e.data.date !== undefined) {
              this.setDate(e.data.date);
            }
            this.updateSelection();
            this.updateCalendarHTML();
            break;
          case Events.desc.request.decrement.day:
            this.setDate(DateUtils.dateAddDays(this.date, -1));
            this.emit(this.mediation.events.emit.cupdate, { date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate()) });
            if (e.data.commit) {
              this.emit(this.mediation.events.emit.commit, { date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate()) });
            }
            this.updateCalendarHTML();
            this.updateSelection();
            break;
          case Events.desc.request.increment.day:
            this.setDate(DateUtils.dateAddDays(this.date, 1));
            this.emit(this.mediation.events.emit.cupdate, { date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate()) });
            if (e.data.commit) {
              this.emit(this.mediation.events.emit.commit, { date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate()) });
            }
            this.updateCalendarHTML();
            this.updateSelection();
            break;
          case Events.desc.request.decrement.week:
            console.log(DateUtils.getDateInPreviousWeek(this.date));
            this.setDate(DateUtils.getDateInPreviousWeek(this.date));
            this.emit(this.mediation.events.emit.cupdate, { date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate()) });
            if (e.data.commit) {
              this.emit(this.mediation.events.emit.commit, { date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate()) });
            }
            this.updateCalendarHTML();
            this.updateSelection();
            break;
          case Events.desc.request.increment.week:
            console.log(DateUtils.getDateInPreviousWeek(this.date));
            this.setDate(DateUtils.getDateInNextWeek(this.date));
            this.emit(this.mediation.events.emit.cupdate, { date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate()) });
            if (e.data.commit) {
              this.emit(this.mediation.events.emit.commit, { date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate()) });
            }
            this.updateCalendarHTML();
            this.updateSelection();
            break;
          default:
            break;
        }
      }
      this.constructor.prototype.notify.call(this, e);
    };

    return Calendar;
  })();