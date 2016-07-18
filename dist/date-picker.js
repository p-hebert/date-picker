(function() {

  var Events = {
    scope: {
      broadcast: "BROADCAST",
      emit: "EMIT"
    },
    desc: {
      commit: "COMMIT",
      rollback: "ROLLBACK",
      request: {
        decrement: {
          day: "DECREMENTDAY",
          week: "DECREMENTWEEK",
          month: "DECREMENTMONTH",
          year: "DECREMENTYEAR",
        },
        increment: {
          day: "INCREMENTDAY",
          week: "INCREMENTWEEK",
          month: "INCREMENTMONTH",
          year: "INCREMENTYEAR",
        }
      },
      update: {
        global: "UPDATE",
        controls: "CTRLUPDATE",
        day: "DAYSCALEUPDATE",
        week: "WEEKSCALEUPDATE",
        month: "MONTHSCALEUPDATE",
        year: "YEARSCALEUPDATE",
        partial: "PARTIALUPDATE",
        bis: "ISUPDATE",
        pcs: "PCONTROLUPDATE",
        yds: "YDISUPDATE",
        mis: "MISUPDATE",
        yis: "YISUPDATE",
        cal: "CALUPDATE",
        mdi: "MDIALER",
        ydi: "YDIALER"
      }
    }
  };
  
  //=include ./events/mutex.js
  var Colleague = (function(){
    function Colleague(mediator, component){
      this.mediator = mediator;
      this.callbacks = {};
      this.mediator.register(this);
      this.mediation.component = component;
      this.mediation.events = {
        broadcast:{ gupdate: this._constructEventString(Events.scope.broadcast, Events.desc.update.global) },
        emit: { gupdate: this._constructEventString(Events.scope.emit, Events.desc.update.global) }
      };
    }
  
    Colleague.prototype.constructor = Colleague;
  
    //Component for Event Strings
    Colleague.prototype.component = 'COLLEAGUE';
  
    Colleague.prototype.enum = {
      callbacks: {
        notify: "notify",
        emit: "emit"
      }
    };
  
    Colleague.prototype.registerCallback = function (name, callback) {
      var exists = false,
          callbacks;
      if(this.enum.callbacks !== undefined){
        callbacks = [this.enum.callbacks, Colleague.prototype.enum.callbacks];
      }else{
        callbacks = [Colleague.prototype.enum.callbacks];
      }
      for(var i = 0; i < callbacks.length; i++){
        for(var key in callbacks[i]){
          if(key === name){
            exists = true;
            break;
          }
        }
      }
      if(exists && typeof callback === "function"){
        if(this.callbacks[name] === undefined) this.callbacks[name] = [];
        this.callbacks[name].push(callback);
        return true;
      }else{
        return false;
      }
    };
  
    Colleague.prototype.callCallback = function (name, data) {
      if(name === undefined) throw new Error();
      var index;
      index = this.enum.callbacks !== undefined ? this.enum.callbacks[name] : undefined;
      index = index === undefined ? Colleague.prototype.enum.callbacks[name] : index;
      if(this.callbacks[index] !== undefined){
        for (var i = 0; i < this.callbacks[index].length; i++) {
          this.callbacks[index][i].call(this, data);
        }
      }
    };
  
    Colleague.prototype.emit = function (eventStr, data) {
      var e = {
            name: eventStr,
            source: this.mediation.component + ':' + this.mediation.uuid,
            data: data
          };
  
      if(eventStr.indexOf(Events.scope.emit) !== -1){
        e.scope = Events.scope.emit;
      }else if(eventStr.indexOf(Events.scope.broadcast) !== -1){
        e.scope = Events.scope.broadcast;
      }
      var desc = eventStr, index = desc.indexOf('_');
      while(index !== -1){
          desc = desc.substring(index+1);
          index = desc.indexOf('_');
      }
      e.desc = desc;
      this.mediator.notify(this, e);
      this.callCallback(Colleague.prototype.enum.callbacks.emit, e);
    };
  
    Colleague.prototype.notify = function (e) {
      this.callCallback(Colleague.prototype.enum.callbacks.notify, e);
    };
  
    Colleague.prototype._constructEventString = function (scope, desc) {
      return this.mediation.component + ':' + this.mediation.uuid + '_' + scope + '_' + desc;
    };
  
    return Colleague;
  })();
  
  var Mediator = (function(){
    function Mediator() {
      this.uuid = UUIDUtils.generateUUID();
      this.uuids = [];
      this.subscriptions = {};
      this.subscribers = {};
      this.takenUUIDs = [];
    }
  
    Mediator.prototype._checkType = function (subscriber) {
        if(!(subscriber instanceof Colleague)) throw new TypeError("Cannot register object that is not instance of Colleague");
    };
  
    Mediator.prototype.register = function(subscriber){
      this._checkType(subscriber);
      var uuid;
      do {
        uuid = UUIDUtils.generateUUID();
      }while(this.takenUUIDs.indexOf(uuid) !== -1);
      this.takenUUIDs.push(uuid);
      if(subscriber.mediation === undefined) subscriber.mediation = {};
      subscriber.mediation.uuid = uuid;
  
      if(this.subscribers[uuid] === undefined){
        this.subscribers[uuid] = { sub: subscriber, events: [] };
      }
    };
  
    Mediator.prototype.subscribe = function (eventstr, subscriber) {
      this._checkType(subscriber);
      if(subscriber.mediation.uuid === undefined){
        this.register(subscriber);
      }
      var uuid = subscriber.mediation.uuid;
      var success = true;
      //Brand new event
      if(this.subscriptions[eventstr] === undefined){
        this.subscriptions[eventstr] = [uuid];
        this.subscribers[uuid].events.push(eventstr);
      //Already subscribed
      }else if(this.subscriptions[eventstr].indexOf(uuid) !== -1){
        success = false;
      //New subscription to already existing event
      }else{
        this.subscriptions[eventstr].push(uuid);
        this.subscribers[uuid].events.push(eventstr);
      }
      return success;
    };
  
    Mediator.prototype.unsubscribe = function (eventstr, subscriber) {
      this._checkType(subscriber);
      var success = true,
          index,
          eventindex;
      //If there is subscriptions for the event,
      //and the subscriber has a subscriber uuid
      if(this.subscriptions[eventstr] !== undefined &&
         subscriber.mediation !== undefined &&
         subscriber.mediation.uuid !== undefined){
  
        index = this.subscriptions[eventstr].indexOf(subscriber.mediation.uuid);
        if(index !== -1){
          //remove event subscription
          this.subscriptions[eventstr].splice(index, 1);
          eventindex = this.subscribers[subscriber[this.uuid]].events.indexOf(eventstr);
          this.subscribers[subscriber[this.uuid]].events.splice(eventindex, 1);
        }
        // If subscriber doesn't listen to anything anymore, remove it.
        // if(this.subscribers[subscriber[this.uuid]].events.length === 0){
        //   delete this.subscribers[subscriber[this.uuid]];
        //   this.takenUUIDs.splice(this.takenUUIDs.indexOf(subscriber[this.uuid]), 1);
        //   delete subscriber[this.uuid];
        // }
      }else{
        success = false;
      }
      return success;
    };
  
    Mediator.prototype.notify = function (source, e) {
      //console.log("Mediator.prototype.notify - forwarding\n" + e.name + "\nto:");
      this._checkType(source);
      var success = true;
      if(source.mediation !== undefined && source.mediation.uuid !== undefined &&
         this.subscriptions[e.name] !== undefined){
        for(var i = 0 ; i < this.subscriptions[e.name].length; i++){
          //console.log(this.subscribers[this.subscriptions[e.name][i]].sub.mediation.component + ':' + this.subscribers[this.subscriptions[e.name][i]].sub.mediation.uuid + " {"+this.subscribers[this.subscriptions[e.name][i]].sub.scale+"}");
          this.subscribers[this.subscriptions[e.name][i]].sub.notify(e);
        }
      }else{
        success = false;
      }
      return success;
    };
  
    return Mediator;
  })();
  
  var DateUtils = {
  
    //Normally one shouldn't include translations directly into code.
    //However in this case there is so little translations that it doesn't matter.
    months: {
      en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      fr: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
    },
  
    days: {
      en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      fr: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
    },
  
    daysuffix: {
      en: ['th','st','nd','rd','th'],
      fr: ['er','']
    },
  
    getMonthString: function(month, language){
      return this.months[language][month];
    },
  
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
    },
    getDateInPreviousWeek: function(date){
      var d = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      d.setUTCDate(d.getUTCDate() - 7);
      return d;
    },
    getDateInNextWeek: function(date){
      var d = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      d.setUTCDate(d.getUTCDate() + 7);
      return d;
    },
    dateAddDays: function(date, days){
      var d = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      d.setUTCDate(d.getUTCDate() + days);
      return d;
    },
    //Get the week's first and last days.
    getWeekFALDays: function(date){
      var week = {};
      week.start = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      week.start.setDate(week.start.getUTCDate() - week.start.getUTCDay());
      week.end = new Date(week.start.getUTCFullYear(), week.start.getUTCMonth(), week.start.getUTCDate());
      week.end.setDate(week.end.getUTCDate() + 6);
      return week;
    },
    //http://stackoverflow.com/a/26426761/4442749
    getDOY: function(date) {
      var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
      var mn = date.getMonth();
      var dn = datestr.getDate();
      var dayOfYear = dayCount[mn] + dn;
      if(mn > 1 && this.isLeapYear()) dayOfYear++;
      return dayOfYear;
    },
    //http://stackoverflow.com/a/6117889/4442749
    getWeekNumber: function (d) {
      // Copy date so don't modify original
      d = new Date(+d);
      d.setHours(0,0,0);
      // Set to nearest Thursday: current date + 4 - current day number
      // Make Sunday's day number 7
      d.setDate(d.getDate() + 4 - (d.getDay()||7));
      // Get first day of year
      var yearStart = new Date(d.getFullYear(),0,1);
      // Calculate full weeks to nearest Thursday
      var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
      // Return array of year and week number
      return [d.getFullYear(), weekNo];
    },
  
    //Take note that the %U will return 1-52 rather than 0-53
    formatDate: function(date, formatstr, language){
      var datestr = "", i = 0, op;
      language = language === undefined || this.months[language] === undefined ?
                'en':
                 language;
      while(formatstr !== ""){
        if(formatstr.charAt(0) === "%"){
          op = formatstr.substring(0,2);
          formatstr = formatstr.substring(2);
          switch (op) {
            case '%a':
                datestr += this.days[language][date.getUTCDay()].substring(0,3);
                break;
            case '%b':
                datestr += this.months[language][date.getUTCMonth()].substring(0,3);
                break;
            case '%c':
                datestr += date.getUTCMonth() + 1;
                break;
            case '%D':
                datestr += date.getUTCDate() + this.daysuffix[Math.min(date.getUTCDate(), this.daysuffix.length-1)];
                break;
            case '%d':
                datestr += (date.getUTCDate() < 10)? '0' + date.getUTCDate(): date.getUTCDate();
                break;
            case '%e':
                datestr += date.getUTCDate();
                break;
            case '%j':
                datestr += this.getDOY(date);
                break;
            case '%M':
                datestr += this.getMonthString(date.getUTCMonth(), language);
                break;
            case '%m':
                datestr += (date.getUTCMonth() < 10)? '0' + date.getUTCMonth(): date.getUTCMonth();
                break;
            case '%U':
                datestr += this.getWeekNumber(date);
                break;
            case '%W':
                datestr += this.days[language][date.getUTCDay()];
                break;
            case '%w':
                datestr += date.getUTCDay();
                break;
            case '%Y':
                datestr += date.getUTCFullYear();
                break;
            case '%y':
                datestr += date.getUTCFullYear() % 100;
                break;
            default:
                break;
          }
        }else{
          datestr += formatstr.substring(0,1);
          formatstr = formatstr.substring(1);
        }
      }
      return datestr;
    },
  };
  
  var NumberUtils = {
    mod: function(n, m) {
      return ((n % m) + m) % m;
    }
  };
  
  var UUIDUtils = {
    //Source
    //http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    generateUUID: function(){
      var lut = []; for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }
      var d0 = Math.random()*0xffffffff|0;
      var d1 = Math.random()*0xffffffff|0;
      var d2 = Math.random()*0xffffffff|0;
      var d3 = Math.random()*0xffffffff|0;
      return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+
        lut[d1&0xff]+lut[d1>>8&0xff]+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+
        lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
        lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
    }
  }
  
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
  var Dialer = (function(){
  
    function Dialer(options, component){
  
      //Scale for this instance
      this.scale = (options.scale && Dialer.prototype.enum.scales[options.scale]) ?
                   Dialer.prototype.enum.scales[options.scale] :
                   Dialer.prototype.enum.scales.month;
      this.scale_initial = this.scale.substring(0,1);
  
      component = component === undefined? this.scale_initial.toUpperCase() + Dialer.prototype.component : component;
      //super()
      Colleague.call(this, options.mediator, component);
      this.mediation.events.emit.dupdate = this._constructEventString(Events.scope.emit, Events.desc.update[this.scale_initial + "di"]);
  
      //Upper/Lower bounds to date value
      this.min_date = options.min_date instanceof Date ?
                      new Date(options.min_date.getUTCFullYear(), options.min_date.getUTCMonth(), options.min_date.getUTCDate()) :
                      undefined;
      this.max_date = options.max_date instanceof Date && options.max_date > this.min_date?
                      new Date(options.max_date.getUTCFullYear(), options.max_date.getUTCMonth(), options.max_date.getUTCDate()) :
                      undefined;
  
      //Date that is modified by the user
      this.date = new Date(options.date.getUTCFullYear(), options.date.getUTCMonth(), options.date.getUTCDate());
  
      this.lang = options.lang !== undefined &&
                  Dialer.prototype.enum.languages[options.lang] !== undefined ?
                  Dialer.prototype.enum.languages[options.lang] : 'en';
  
      this.dialers = [];
      this.indexes = [];
      this.index = 0;
      this.generateInitialMax();
      this.html = this.getDialerHTML();
    }
  
    //Binding the prototype of the Parent object
    //Properties will be overriden on this one.
    Dialer.prototype = Object.create(Colleague.prototype);
  
    //Binding the constructor to the prototype
    Dialer.prototype.constructor = Colleague;
  
    //Component for Event Strings
    Dialer.prototype.component = 'DIALER';
  
    Dialer.prototype.enum = {
      scales: {
        month : "month",
        year : "year",
      },
      languages: {
        en: 'en',
        fr: 'fr'
      }
    };
  
    Dialer.prototype.getHTML = function(){
      return this.html;
    };
  
    Dialer.prototype.getDate = function () {
      return this.prev_date;
    };
  
    Dialer.prototype.setDate = function (date) {
      if(date instanceof Date && (this.min_date === undefined || date >= this.min_date) && (this.max_date === undefined || date <= this.max_date)){
        this.date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      }
    };
  
    Dialer.prototype.getDialerHTML = function () {
      var dialer;
      if(this.dialers[this.indexes.indexOf(this.index)] !== undefined){
        dialer = this.dialers[this.indexes.indexOf(this.index)];
        return dialer;
      }else{
        dialer = this.generateHTML();
        this.indexes.push(this.index);
        this.dialers.push(dialer);
        return dialer;
      }
    };
  
    Dialer.prototype.updateDialerHTML = function () {
      var parentNode = this.html.parentNode;
        parentNode.removeChild(this.html);
        this.html = this.getDialerHTML();
        parentNode.appendChild(this.html);
        this.updateSelection();
    };
  
    Dialer.prototype.generateInitialMax = function () {
      var medianyear = this.date.getUTCFullYear(),
          factor = (8 - NumberUtils.mod(medianyear, 8));
      this.init_max = factor === 8? medianyear : medianyear + factor;
    };
  
    Dialer.prototype.generateHTML = function () {
      var self = this,
          i = 0,
          dialer = document.createElement('div'),
          callback = function(e){
              self.onSpanClick(e.target);
          };
      var span;
      if(this.scale === Dialer.prototype.enum.scales.month){
        for(i = 0; i < 12; i++){
          span = document.createElement('span');
          span.ddata = {
            month : i,
          };
          span.innerHTML = DateUtils.getMonthString(i, this.lang).substring(0,3);
          this.applyClass(span, dialer);
          span.addEventListener('click', callback);
          dialer.appendChild(span);
        }
      }else if(this.scale === Dialer.prototype.enum.scales.year){
        for(i = 0; i < 8; i++){
          span = document.createElement('span');
          span.ddata = {
            year : this.init_max - (8-i) + this.index*8
          };
          span.innerHTML = span.ddata.year;
          this.applyClass(span, dialer);
          span.addEventListener('click', callback);
          dialer.appendChild(span);
        }
      }
      return dialer;
    };
  
    Dialer.prototype.applyClass = function (span, context) {
      if(this.testMin(span) && this.testMax(span)){
        span.className = "date-picker-"+this.scale+"-cell";
        this.newSelection(span, context);
        span.ddata.disabled = false;
      }else{
        span.ddata.disabled = true;
        span.className = "date-picker-"+this.scale+"-cell disabled";
      }
    };
  
    Dialer.prototype.testMin = function (span) {
  
      if(this.min_date === undefined) return true;
      if(this.scale === Dialer.prototype.enum.scales.month){
        return !(this.min_date.getUTCMonth() > span.ddata.month &&
               this.min_date.getUTCFullYear() >= this.date.getUTCFullYear());
      }else if(this.scale === Dialer.prototype.enum.scales.year){
        return this.min_date.getUTCFullYear() <= span.ddata.year;
      }
    };
  
    Dialer.prototype.testMax = function (span) {
      if(this.max_date === undefined) return true;
      if(this.scale === Dialer.prototype.enum.scales.month){
        return !(this.max_date.getUTCMonth() < span.ddata.month &&
               this.max_date.getUTCFullYear() <= this.date.getUTCFullYear());
      }else if(this.scale === Dialer.prototype.enum.scales.year){
        return this.max_date.getUTCFullYear() >= span.ddata.year;
      }
    };
  
    Dialer.prototype.updateSelection = function (span) {
      var dialer = this.html,
          date = {year : this.date.getUTCFullYear(), month : this.date.getUTCMonth()};
      if(dialer.current !== undefined && dialer.current.ddata[this.scale] !== date[this.scale]){
        this.removeSelection();
      }
      if(span === undefined){
        for (var i = 0; i < this.html.children.length; i++) {
          this.applyClass(this.html.children[i]);
        }
      }else{
        this.applyClass(span);
      }
    };
  
    Dialer.prototype.newSelection = function (span, context) {
      var date = {month: this.date.getUTCMonth(), year: this.date.getUTCFullYear()};
      if(span.ddata[this.scale] === date[this.scale]){
        if(context !== undefined){
          context.current = span;
          if(this.scale === Dialer.prototype.enum.scales.month){
            context.current.className = "date-picker-month-cell active";
          }else if (this.scale === Dialer.prototype.enum.scales.year){
            context.current.className = "date-picker-year-cell active";
          }
        }else{
          this.html.current = span;
          if(this.scale === Dialer.prototype.enum.scales.month){
            this.html.current.className = "date-picker-month-cell active";
          }else if (this.scale === Dialer.prototype.enum.scales.year){
            this.html.current.className = "date-picker-year-cell active";
          }
        }
      }
    };
  
    Dialer.prototype.removeSelection = function () {
      if(this.html.current !== undefined){
        if(this.scale === Dialer.prototype.enum.scales.month){
          this.html.current.className = "date-picker-month-cell";
        }else if (this.scale === Dialer.prototype.enum.scales.year){
          this.html.current.className = "date-picker-year-cell";
        }
      }
    };
  
    Dialer.prototype.onSpanClick = function (span) {
      if(span.ddata.disabled === false){
        if(this.scale === Dialer.prototype.enum.scales.month){
          this.date.setUTCMonth(span.ddata.month);
        }else if(this.scale === Dialer.prototype.enum.scales.year){
          this.date.setUTCFullYear(span.ddata.year);
        }
        this.emit(this.mediation.events.emit.dupdate, {date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate())});
        this.updateSelection(span);
      }
    };
  
    Dialer.prototype.subscribe = function (parent) {
      if(parent !== undefined){
        this.mediator.subscribe(this.mediation.events.emit.dupdate, parent);
      }
    };
  
    Dialer.prototype.notify = function (e) {
      if(e.scope === Events.scope.broadcast){
        switch(e.desc){
          case Events.desc.update.partial:
            if(e.data.min_date !== undefined && e.data.min_date instanceof Date &&
              (this.max_date === undefined || e.data.min_date < this.max_date)){
              this.min_date = new Date(e.data.min_date.getUTCFullYear(), e.data.min_date.getUTCMonth(), e.data.min_date.getUTCDate());
              this.updateSelection();
            }
            if(e.data.max_date !== undefined && e.data.max_date instanceof Date &&
              (this.min_date === undefined || e.data.max_date > this.min_date)){
              this.max_date = new Date(e.data.max_date.getUTCFullYear(), e.data.max_date.getUTCMonth(), e.data.max_date.getUTCDate());
              this.updateSelection();
            }
            if(e.data.date !== undefined){
              this.setDate(e.data.date);
              if(this.scale === Dialer.prototype.enum.scales.year){
                this.updateDialerHTML();
              }else if(this.scale === Dialer.prototype.enum.scales.month){
                this.updateSelection();
              }
            }
            if(e.data.index !== undefined && typeof e.data.index === "number"){
              this.index = e.data.index;
              this.updateDialerHTML();
            }
  
            break;
          case Events.desc.update.mdi:
            if(e.data.date !== undefined && e.data.date instanceof Date){
              this.setDate(e.data.date);
              this.updateSelection();
            }
            break;
          case Events.desc.update.ydi:
            if(e.data.index !== undefined && typeof e.data.index === "number"){
              this.index = e.data.index;
            }
            if(e.data.date !== undefined && e.data.date instanceof Date){
              this.setDate(e.data.date);
            }
            this.updateDialerHTML();
            break;
          default:
            break;
        }
      }
      this.constructor.prototype.notify.call(this, e);
    };
  
    return Dialer;
  })();
  
  var IncrementSlider = (function(){
    function IncrementSlider(options, component){
      //super()
      component = component === undefined? IncrementSlider.prototype.component : component;
      Colleague.call(this, options.mediator, component);
      this.mediation.events.emit.bupdate = this._constructEventString(Events.scope.emit, Events.desc.update.bis);
      this.min_value = options.min_value;
      this.max_value = options.max_value;
      this.value = options.value;
    }
  
    //Binding the prototype of the Parent object
    //Properties will be overriden on this one.
    IncrementSlider.prototype = Object.create(Colleague.prototype);
  
    //Binding the constructor to the prototype
    IncrementSlider.prototype.constructor = Colleague;
  
    //Component for Event Strings
    IncrementSlider.prototype.component = 'INCSLIDER';
  
    IncrementSlider.prototype.enum = {
      callbacks: {
        notify: "notify",
        emit: "emit",
        prev: "prev",
        maxchange: "maxchange",
        minchange: "minchange",
        valuechange: "valuechange",
        next: "next",
        event: "event"
      }
    };
  
    IncrementSlider.prototype.generateHTML = function(){
      var self = this;
      var inner =
        '<span class="increment-input-value"></span>' +
        '<nav>' +
          '<svg class="increment-input-button prev"><use xlink:href="#arrow-prev-small"></svg>' +
          '<svg class="increment-input-button next"><use xlink:href="#arrow-next-small"></svg>' +
        '</nav>';
      this.input = document.createElement('div');
      this.input.className = "increment-input";
      this.input.innerHTML = inner;
      this.setUIValue();
      this.prev = this.input.children[1].children[0];
      this.prev.addEventListener('click', function(){
        self.onPrevClick();
      });
      this.next = this.input.children[1].children[1];
      this.next.addEventListener('click', function(){
        self.onNextClick();
      });
    };
  
    IncrementSlider.prototype.getHTML = function () {
      return this.input;
    };
  
    IncrementSlider.prototype.getValue = function () {
      return this.value;
    };
  
    IncrementSlider.prototype.setValue = function(value){
      this.value = value;
      this.setUIValue();
      this.callCallback(IncrementSlider.prototype.enum.callbacks.valuechange);
    };
  
    IncrementSlider.prototype.onPrevClick = function () {
      this.callCallback(IncrementSlider.prototype.enum.callbacks.prev);
    };
  
    IncrementSlider.prototype.onNextClick = function () {
      this.callCallback(IncrementSlider.prototype.enum.callbacks.next);
    };
  
    IncrementSlider.prototype.setUIValue = function(){
      this.input.children[0].innerHTML = this.value;
    };
  
    IncrementSlider.prototype.updateUIControls = function(){
      //Hiding previous button if at the min value
      if(this.testMin()){
        this.prev.setAttribute("class", "increment-input-button prev disabled");
        this.prev.isDisabled = true;
        //Hiding next button if at the max value
      }else if(this.testMax()){
        this.next.setAttribute("class", "increment-input-button next disabled");
        this.next.isDisabled = true;
      //Else making sure button is visible
      }else{
        if(this.min_value !== undefined){
          this.prev.setAttribute("class", "increment-input-button prev");
          this.prev.isDisabled = false;
        }
        if(this.max_value !== undefined){
          this.next.setAttribute("class", "increment-input-button next");
          this.next.isDisabled = false;
        }
      }
    };
  
    IncrementSlider.prototype.testMin = function(){
      return this.min_value !== undefined && this.min_value == this.getValue();
    };
  
    IncrementSlider.prototype.testMax = function(){
      return this.max_value !== undefined && this.max_value == this.getValue();
    };
  
    IncrementSlider.prototype.subscribe = function (parent) {
      if(parent !== undefined){
        this.mediator.subscribe(this.mediation.events.emit.gupdate, parent);
        this.mediator.subscribe(this.mediation.events.emit.bupdate, parent);
      }
    };
  
    return IncrementSlider;
  
  })();
  
  var YearIncrementSlider = (function() {
    function YearIncrementSlider(options, component) {
      //super()
      component = component === undefined ? YearIncrementSlider.prototype.component : component;
      IncrementSlider.call(this, options, component);
      this.mediation.events.emit.commit = this._constructEventString(Events.scope.emit, Events.desc.commit);
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
    YearIncrementSlider.prototype.setValue = function(value) {
      this.date = new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
      this.value = this.date;
      this.setUIValue();
      this.callCallback(IncrementSlider.prototype.enum.callbacks.valuechange);
    };
  
    YearIncrementSlider.prototype.setMinValue = function(value) {
      if (value instanceof Date &&
        (this.max_date === undefined || value < this.max_date)) {
        this.min_date = new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
        this.min_value = this.min_date;
        this.callCallback(IncrementSlider.prototype.enum.callbacks.minchange);
      }
    };
  
    YearIncrementSlider.prototype.setMaxValue = function(value) {
      if (value instanceof Date &&
        (this.min_date === undefined || value > this.min_date)) {
        this.max_date = new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
        this.max_value = this.max_date;
        this.callCallback(IncrementSlider.prototype.enum.callbacks.maxchange);
      }
    };
  
    /**
     * @override
     **/
    YearIncrementSlider.prototype.setUIValue = function() {
      this.input.children[0].innerHTML = this.date.getUTCFullYear();
    };
  
    /**
     * @override
     **/
    YearIncrementSlider.prototype.testMin = function() {
      return this.min_date !== undefined && this.min_date.getUTCFullYear() === this.date.getUTCFullYear();
    };
  
    /**
     * @override
     **/
    YearIncrementSlider.prototype.testMax = function() {
      return this.max_date !== undefined && this.max_date.getUTCFullYear() === this.date.getUTCFullYear();
    };
  
    /**
     * @override
     **/
    YearIncrementSlider.prototype.onPrevClick = function() {
      if (this.prev.isDisabled === true) {
        return;
      }
      var year = this.date.getUTCFullYear() - 1,
        daysInMonth = DateUtils.daysInMonth(this.date.getUTCFullYear() - 1, this.date.getUTCMonth()),
        uiday = false,
        uimonth = false,
        uiyear = false;
      //Checks if action is legal (not going below min year)
      if (this.min_date === undefined || this.min_date.getUTCFullYear() <= year) {
        //To prevent invalid dates like Feb 30th
        if (this.date.getUTCDate() > daysInMonth) {
  
          this.date.setUTCDate(daysInMonth);
        }
  
        this.date.setUTCFullYear(year);
        //Making sure that we are not going below the min date on the smaller scales than year
        if (this.min_date !== undefined && this.min_date.getUTCFullYear() === this.date.getUTCFullYear()) {
          if (this.min_date.getUTCMonth() > this.date.getUTCMonth()) {
            this.date.setUTCMonth(this.min_date.getUTCMonth());
            this.date.setUTCDate(this.min_date.getUTCDate());
          } else if (this.min_date.getUTCDay() > this.date.getUTCDate() && this.min_date.getUTCMonth() === this.date.getUTCMonth()) {
            this.date.setUTCDate(this.min_date.getUTCDate());
          }
        }
        this.setValue(this.date);
        this.updateUIControls();
        this.emit(this.mediation.events.emit.yupdate, { date: this.date });
        IncrementSlider.prototype.onPrevClick.call(this);
      }
      //else do nothing
    };
  
    /**
     * @override
     **/
    YearIncrementSlider.prototype.onNextClick = function() {
      if (this.next.isDisabled === true) {
        return;
      }
      var year = this.date.getUTCFullYear() + 1,
        daysInMonth = DateUtils.daysInMonth(this.date.getUTCFullYear() + 1, this.date.getUTCMonth());
      //Checks if action is legal (not going below min year)
      if (this.max_date === undefined || this.max_date.getUTCFullYear() >= year) {
  
        //To prevent invalid dates like Feb 30th
        if (this.date.getUTCDate() > daysInMonth) {
          this.date.setUTCDate(daysInMonth);
        }
  
        this.date.setUTCFullYear(year);
  
        //Making sure that we are not going above the max date on the smaller scales than year
        if (this.max_date !== undefined && this.max_date.getUTCFullYear() === year) {
          if (this.max_date.getUTCMonth() < this.date.getUTCMonth()) {
            this.date.setUTCMonth(this.max_date.getUTCMonth());
            this.date.setUTCDate(this.max_date.getUTCDate());
          } else if (this.max_date !== undefined && this.max_date.getUTCDay() > this.date.getUTCDate() && this.min_date.getUTCMonth() === this.date.getUTCMonth()) {
            this.date.setUTCDate(this.max_date.getUTCDate());
          }
        }
  
        this.setValue(this.date);
        this.updateUIControls();
        this.emit(this.mediation.events.emit.yupdate, { date: this.date });
        IncrementSlider.prototype.onNextClick.call(this);
      }
      //else do nothing
    };
  
    YearIncrementSlider.prototype.subscribe = function(parent) {
      if (parent !== undefined) {
        this.mediator.subscribe(this.mediation.events.emit.yupdate, parent);
        this.mediator.subscribe(this.mediation.events.emit.commit, parent);
      }
    };
  
    /**
     * @override
     **/
    YearIncrementSlider.prototype.notify = function(e) {
      if (e.scope === Events.scope.broadcast) {
        switch (e.desc) {
          case Events.desc.update.partial:
            if (e.data.min_date !== undefined) {
              this.setMinValue(e.data.min_date);
            }
            if (e.data.max_date !== undefined) {
              this.setMaxValue(e.data.max_date);
            }
          case Events.desc.update.yis:
            if (e.data.date !== undefined && e.data.date instanceof Date) {
              this.setValue(e.data.date);
            }
            this.updateUIControls();
            break;
          case Events.desc.request.decrement.year:
            this.onPrevClick();
            if (e.data.commit) {
              this.emit(this.mediation.events.emit.commit, { date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate()) });
            }
            break;
          case Events.desc.request.increment.year:
            this.onNextClick();
            if (e.data.commit) {
              this.emit(this.mediation.events.emit.commit, { date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate()) });
            }
            break;
          default:
            break;
        }
      }
      IncrementSlider.prototype.notify.call(this, e);
    };
  
    return YearIncrementSlider;
  })();
  var MonthIncrementSlider = (function() {
    function MonthIncrementSlider(options, component) {
      //super()
      component = component === undefined ? MonthIncrementSlider.prototype.component : component;
      IncrementSlider.call(this, options, component);
      this.mediation.events.emit.commit = this._constructEventString(Events.scope.emit, Events.desc.commit);
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
    MonthIncrementSlider.prototype.setValue = function(value) {
      this.date = new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
      this.value = this.date;
      this.setUIValue();
      this.callCallback(IncrementSlider.prototype.enum.callbacks.valuechange);
    };
  
    MonthIncrementSlider.prototype.setMinValue = function(value) {
      if (value instanceof Date &&
        (this.max_date === undefined || value < this.max_date)) {
        this.min_date = new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
        this.min_value = this.min_date;
        this.callCallback(IncrementSlider.prototype.enum.callbacks.minchange);
      }
    };
  
    MonthIncrementSlider.prototype.setMaxValue = function(value) {
      if (value instanceof Date &&
        (this.min_date === undefined || value > this.min_date)) {
        this.max_date = new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
        this.max_value = this.max_date;
        this.callCallback(IncrementSlider.prototype.enum.callbacks.maxchange);
      }
    };
  
    /**
     * @override
     **/
    MonthIncrementSlider.prototype.setUIValue = function() {
      this.input.children[0].innerHTML = DateUtils.getMonthString(this.date.getUTCMonth(), this.lang);
    };
  
    /**
     * @override
     **/
    MonthIncrementSlider.prototype.testMin = function() {
      return this.min_date !== undefined &&
        this.min_date.getUTCFullYear() === this.date.getUTCFullYear() && this.min_date.getUTCMonth() === this.date.getUTCMonth();
    };
  
    /**
     * @override
     **/
    MonthIncrementSlider.prototype.testMax = function() {
      return this.max_date !== undefined &&
        this.max_date.getUTCFullYear() === this.date.getUTCFullYear() && this.max_date.getUTCMonth() === this.date.getUTCMonth();
    };
  
    /**
     * @override
     **/
    MonthIncrementSlider.prototype.onPrevClick = function() {
      if (this.prev.isDisabled === true) {
        return;
      }
      var self = this;
      var year = this.date.getUTCFullYear(),
        month = NumberUtils.mod(this.date.getUTCMonth() - 1, 12),
        apply = false;
      //If no min_date, no constraints.
      if (this.min_date === undefined || this.min_date.getUTCFullYear() < year - 1) {
        apply = true;
        this.decrementMonth();
        if (month === 11) {
          this.date.setUTCFullYear(year - 1);
        }
        //If min year is = to year, must check for month and day.
      } else if (this.min_date.getUTCFullYear() === year && month !== 11) {
        //Check if action is valid
        if (this.min_date.getUTCMonth() < month || this.min_date.getUTCMonth() === month) {
          apply = true;
          this.decrementMonth();
        }
        //Granted min month = month
        //Resets the day if conflict between min day and currently selected day
        if (this.min_date.getUTCMonth() === month && this.min_date.getUTCDay() > this.date.getUTCDay()) {
          this.date.setUTCDate(this.min_date.getUTCDate());
        }
  
      } else if (this.min_date.getUTCFullYear() === year - 1 && month === 11) {
        if (this.min_date.getUTCMonth() < month || this.min_date.getUTCMonth() === month) {
          apply = true;
          this.decrementMonth();
          this.date.setUTCFullYear(year - 1);
        }
  
        if (this.min_date.getUTCMonth() === month && this.min_date.getUTCDay() > this.date.getUTCDay()) {
          this.date.setUTCDate(this.min_date.getUTCDate());
        }
  
      } else if (this.min_date.getUTCFullYear() === year - 1 && month !== 11) {
        apply = true;
        this.decrementMonth();
      }
  
      if (apply) {
        this.setValue(this.date);
        this.updateUIControls();
        this.emit(this.mediation.events.emit.mupdate, { date: this.date });
        IncrementSlider.prototype.onPrevClick.call(this);
      }
    };
  
    /**
     * @override
     **/
    MonthIncrementSlider.prototype.onNextClick = function() {
      if (this.next.isDisabled === true) {
        return;
      }
      var year = this.date.getUTCFullYear(),
        month = NumberUtils.mod(this.date.getUTCMonth() + 1, 12),
        apply = false;
      //If no max_date, no constraints.
      if (this.max_date === undefined || this.max_date.getUTCFullYear() > year + 1) {
        apply = true;
        this.incrementMonth();
        if (month === 0) {
          this.date.setUTCFullYear(year + 1);
        }
        //If max year is = to year, must check for month and day.
      } else if (this.max_date.getUTCFullYear() === year && month !== 0) {
        //Check if action is valid
        if (this.max_date.getUTCMonth() > month || this.max_date.getUTCMonth() === month) {
          apply = true;
          this.incrementMonth();
        }
        //Granted max month = month
        //Resets the day if conflict between max day and currently selected day
        if (this.max_date.getUTCMonth() === month && this.max_date.getUTCDay() < this.date.getUTCDay()) {
          this.date.setUTCDate(this.max_date.getUTCDate());
        }
  
      } else if (this.max_date.getUTCFullYear() === year + 1 && month === 0) {
        if (this.max_date.getUTCMonth() > month || this.max_date.getUTCMonth() === month) {
          apply = true;
          this.incrementMonth();
          this.date.setUTCFullYear(year + 1);
        }
  
        if (this.max_date.getUTCMonth() === month && this.max_date.getUTCDay() < this.date.getUTCDay()) {
          this.date.setUTCDate(this.max_date.getUTCDate());
        }
  
      } else if (this.max_date.getUTCFullYear() === year + 1 && month !== 0) {
        apply = true;
        this.incrementMonth();
      } else {
        //do nothing
      }
  
      if (apply) {
        this.setValue(this.date);
        this.updateUIControls();
        this.emit(this.mediation.events.emit.mupdate, { date: this.date });
        IncrementSlider.prototype.onNextClick.call(this);
      }
    };
  
    MonthIncrementSlider.prototype.incrementMonth = function() {
      var month = NumberUtils.mod(this.date.getUTCMonth() + 1, 12),
        daysInMonth = month !== 0 ?
        DateUtils.daysInMonth(this.date.getUTCFullYear(), month) :
        DateUtils.daysInMonth(this.date.getUTCFullYear() + 1, month);
      //To prevent invalid dates like Feb 30th
      //Takes in account change of year
      if (this.date.getUTCDate() > daysInMonth) {
        this.date.setUTCDate(daysInMonth);
      }
      this.date.setUTCMonth(month);
    };
  
    MonthIncrementSlider.prototype.decrementMonth = function() {
      var month = NumberUtils.mod(this.date.getUTCMonth() - 1, 12),
        daysInMonth = month !== 11 ?
        DateUtils.daysInMonth(this.date.getUTCFullYear(), month) :
        DateUtils.daysInMonth(this.date.getUTCFullYear() - 1, month);
      //To prevent invalid dates like Feb 30th
      //Takes in account change of year
      if (this.date.getUTCDate() > daysInMonth) {
        this.date.setUTCDate(daysInMonth);
      }
      this.date.setUTCMonth(month);
    };
  
    MonthIncrementSlider.prototype.subscribe = function(parent) {
      if (parent !== undefined) {
        this.mediator.subscribe(this.mediation.events.emit.mupdate, parent);
        this.mediator.subscribe(this.mediation.events.emit.commit, parent);
      }
    };
  
    /**
     * @override
     **/
    MonthIncrementSlider.prototype.notify = function(e) {
      if (e.scope === Events.scope.broadcast) {
        switch (e.desc) {
          case Events.desc.update.partial:
            if (e.data.min_date !== undefined) {
              this.setMinValue(e.data.min_date);
            }
            if (e.data.max_date !== undefined) {
              this.setMaxValue(e.data.max_date);
            }
          case Events.desc.update.mis:
            if (e.data.date !== undefined && e.data.date instanceof Date) {
              this.setValue(e.data.date);
            }
            this.updateUIControls();
            break;
          case Events.desc.request.decrement.month:
            this.onPrevClick();
            if (e.data.commit) {
              this.emit(this.mediation.events.emit.commit, { date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate()) });
            }
            break;
          case Events.desc.request.increment.month:
            this.onNextClick();
            if (e.data.commit) {
              this.emit(this.mediation.events.emit.commit, { date: new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate()) });
            }
            break;
          default:
            break;
        }
      }
      IncrementSlider.prototype.notify.call(this, e);
    };
  
    return MonthIncrementSlider;
  })();
  var YDialerIncrementSlider = (function(){
    function YDialerIncrementSlider(options, component){
      //super()
      component = component === undefined? YDialerIncrementSlider.prototype.component : component;
      IncrementSlider.call(this, options, component);
      this.mediation.events.emit.ydupdate = this._constructEventString(Events.scope.emit, Events.desc.update.yds);
      //Upper/Lower bounds to date value
      this.min_date = options.min_date instanceof Date ?
                      new Date(options.min_date.getUTCFullYear(), options.min_date.getUTCMonth(), options.min_date.getUTCDate()) :
                      undefined;
      this.max_date = options.max_date instanceof Date && options.max_date > this.min_date?
                      new Date(options.max_date.getUTCFullYear(), options.max_date.getUTCMonth(), options.max_date.getUTCDate()) :
                      undefined;
  
      //Date that is modified by the user
      this.date = new Date(options.date.getUTCFullYear(), options.date.getUTCMonth(), options.date.getUTCDate());
  
      this.index = 0;
      this.updateRange();
      this.generateHTML();
    }
  
    //Binding the prototype of the Parent object
    //Properties will be overriden on this one.
    YDialerIncrementSlider.prototype = Object.create(IncrementSlider.prototype);
  
    //Binding the constructor to the prototype
    YDialerIncrementSlider.prototype.constructor = IncrementSlider;
  
    //Component for Event Strings
    YDialerIncrementSlider.prototype.component = 'YDINCSLIDER';
  
    YDialerIncrementSlider.prototype.enum = {
      callbacks: {
        notify: "notify",
        emit: "emit",
        prev: "prev",
        datechange: "datechange",
        next: "next",
        event: "event"
      }
    };
  
    YDialerIncrementSlider.prototype.setDate = function(date){
      this.date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      this.callCallback(YDialerIncrementSlider.prototype.enum.callbacks.datechange, date);
    };
  
    YDialerIncrementSlider.prototype.setMinValue = function(value){
      if(value instanceof Date &&
        (this.max_date === undefined || value < this.max_date)){
        this.min_date = new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
        this.min_value = this.min_date;
        this.callCallback(IncrementSlider.prototype.enum.callbacks.minchange);
      }
    };
  
    YDialerIncrementSlider.prototype.setMaxValue = function(value){
      if(value instanceof Date &&
        (this.min_date === undefined || value > this.min_date)){
        this.max_date = new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
        this.max_value = this.max_date;
        this.callCallback(IncrementSlider.prototype.enum.callbacks.maxchange);
      }
    };
  
    YDialerIncrementSlider.prototype.updateRange = function () {
      var medianyear = this.date.getUTCFullYear(),
          factor = (8 - NumberUtils.mod(medianyear, 8));
      if(this.range === undefined){
        this.range = {};
        this.range.max = factor === 8? medianyear : medianyear + factor;
        this.range.min = this.range.max - 7;
        this.range.init_max = this.range.max;
        this.range.init_min = this.range.min;
      }else{
        this.range.max = factor === 8? medianyear : medianyear + factor;
        this.range.min = this.range.max - 7;
      }
    };
  
    YDialerIncrementSlider.prototype.update = function () {
      this.updateRange();
      this.index = (this.range.max - this.range.init_max)/8;
    };
  
    YDialerIncrementSlider.prototype.onPrevClick = function () {
      if(this.prev.isDisabled === true){
        return;
      }
      if(this.min_date === undefined || this.range.max - 8 >= this.min_date.getUTCFullYear()){
        this.range.max -= 8 ;
        this.range.min -= 8 ;
        this.index--;
        this.updateUIControls();
        this.emit(this.mediation.events.emit.ydupdate, {index: this.index});
        IncrementSlider.prototype.onPrevClick.call(this);
      }
    };
  
    YDialerIncrementSlider.prototype.onNextClick = function () {
      if(this.next.isDisabled === true){
        return;
      }
      if(this.max_date === undefined || this.range.min + 8 <= this.max_date.getUTCFullYear()){
        this.range.max += 8 ;
        this.range.min += 8 ;
        this.index++;
        this.updateUIControls();
        this.emit(this.mediation.events.emit.ydupdate, {index: this.index});
        IncrementSlider.prototype.onPrevClick.call(this);
      }
    };
  
    /**
    * @override
    **/
    YDialerIncrementSlider.prototype.testMin = function () {
      return this.min_date !== undefined && this.min_date.getUTCFullYear() >= this.range.min;
    };
  
    /**
    * @override
    **/
    YDialerIncrementSlider.prototype.testMax = function () {
      return this.max_date !== undefined && this.max_date.getUTCFullYear() <= this.range.max;
    };
  
    YDialerIncrementSlider.prototype.subscribe = function (parent) {
      if(parent !== undefined){
        this.mediator.subscribe(this.mediation.events.emit.ydupdate, parent);
      }
    };
  
    /**
    * @override
    **/
    YDialerIncrementSlider.prototype.notify = function (e) {
      if(e.scope === Events.scope.broadcast){
        switch(e.desc){
          case Events.desc.update.partial:
            if(e.data.min_date !== undefined){
              this.setMinValue(e.data.min_date);
            }
            if(e.data.max_date !== undefined){
              this.setMaxValue(e.data.max_date);
            }
          case Events.desc.update.yds:
            if(e.data.date !== undefined && e.data.date instanceof Date){
              this.setDate(e.data.date);
              this.update();
            }
            if(this.min_date > this.date){
              this.setDate(this.min_date);
              this.update();
            }
            if(this.max_date < this.date){
              this.setDate(this.max_date);
              this.update();
            }
            this.updateUIControls();
            break;
          default:
            break;
        }
      }
      IncrementSlider.prototype.notify.call(this, e);
    };
  
  
    return YDialerIncrementSlider;
  
  })();
  
  var PickerControls = (function() {
    function PickerControls(options, component) {
      //super()
      component = component === undefined ? PickerControls.prototype.component : component;
      IncrementSlider.call(this, options, component);
      this.generateEvents();
  
      //Upper/Lower bounds to date value
      this.min_date = options.min_date instanceof Date ?
        new Date(options.min_date.getUTCFullYear(), options.min_date.getUTCMonth(), options.min_date.getUTCDate()) :
        undefined;
      this.max_date = options.max_date instanceof Date && options.max_date > this.min_date ?
        new Date(options.max_date.getUTCFullYear(), options.max_date.getUTCMonth(), options.max_date.getUTCDate()) :
        undefined;
      this.min_value = this.min_date;
      this.max_value = this.max_date;
  
      //Date that is modified by the user
      this.date = new Date(options.date.getUTCFullYear(), options.date.getUTCMonth(), options.date.getUTCDate());
  
      //Scale for this instance
      this.scale = (options.scale && PickerControls.prototype.enum.scales[options.scale]) ?
        PickerControls.prototype.enum.scales[options.scale] :
        PickerControls.prototype.enum.scales.day;
      this.lang = options.lang !== undefined &&
        PickerControls.prototype.enum.languages[options.lang] !== undefined ?
        PickerControls.prototype.enum.languages[options.lang] : 'en';
      this.generateHTML();
    }
  
    //Binding the prototype of the Parent object
    //Properties will be overriden on this one.
    PickerControls.prototype = Object.create(IncrementSlider.prototype);
  
    //Binding the constructor to the prototype
    PickerControls.prototype.constructor = IncrementSlider;
  
    //Component for Event Strings
    PickerControls.prototype.component = 'PCONTROLS';
  
  
    //Enumerable Values
    //Building upon prototype
    PickerControls.prototype.enum = IncrementSlider.prototype.enum;
  
    PickerControls.prototype.enum.scales = {
      day: "day",
      week: "week",
      month: "month",
      year: "year"
    };
  
    PickerControls.prototype.enum.languages = {
      en: 'en',
      fr: 'fr'
    };
  
    /**
     * @override
     **/
    PickerControls.prototype.setValue = function(value) {
      if (value !== undefined &&
        (this.min_date === undefined || value >= this.min_date) &&
        (this.max_date === undefined || value <= this.max_date)) {
        this.date = new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
      }
      switch (this.scale) {
        case PickerControls.prototype.enum.scales.day:
        case PickerControls.prototype.enum.scales.month:
        case PickerControls.prototype.enum.scales.year:
          this.period = new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate());
          break;
        case PickerControls.prototype.enum.scales.week:
          this.period = DateUtils.getWeekFALDays(this.date);
          break;
      }
      this.value = this.date;
      this.setUIValue();
      this.callCallback(PickerControls.prototype.enum.callbacks.valuechange, value);
    };
  
    /**
     * @override
     **/
    PickerControls.prototype.setUIValue = function() {
      var uivalue = "";
      switch (this.scale) {
        case PickerControls.prototype.enum.scales.day:
          switch (this.lang) {
            case PickerControls.prototype.enum.languages.en:
              uivalue = DateUtils.formatDate(this.period, '%a, %M %e %Y', this.lang);
              break;
            case PickerControls.prototype.enum.languages.fr:
              uivalue = DateUtils.formatDate(this.period, 'le %e%D %M %Y').toLowerCase();
              uivalue = uivalue.charAt(0).toUpperCase() + uivalue.slice(1);
              break;
            default:
              break;
          }
          break;
        case PickerControls.prototype.enum.scales.week:
          switch (this.lang) {
            case PickerControls.prototype.enum.languages.en:
              uivalue = DateUtils.formatDate(this.period.start, '%b %e');
              uivalue += " - ";
              uivalue += DateUtils.formatDate(this.period.end, '%b %e, %Y');
              break;
            case PickerControls.prototype.enum.languages.fr:
              uivalue = "Semaine du ";
              uivalue += DateUtils.formatDate(this.period.start, '%e%D %M');
              uivalue += " au ";
              uivalue += DateUtils.formatDate(this.period.end, '%e%D %M %Y');
              break;
            default:
              break;
          }
          break;
        case PickerControls.prototype.enum.scales.month:
          switch (this.lang) {
            case PickerControls.prototype.enum.languages.en:
            case PickerControls.prototype.enum.languages.fr:
              uivalue = DateUtils.formatDate(this.period, '%M %Y');
              break;
            default:
              break;
          }
          break;
        case PickerControls.prototype.enum.scales.year:
          uivalue = this.period.getUTCFullYear();
          break;
        default:
          break;
      }
      this.input.children[1].innerHTML = uivalue;
  
    };
  
    /**
     * @override
     **/
    PickerControls.prototype.generateHTML = function() {
      var self = this;
      var inner =
        '<svg class="date-picker-global-increment prev"><use xlink:href="#arrow-prev-big"></svg>' +
        '<div class="date-picker-date-label"></div>' +
        '<svg class="date-picker-global-increment next"><use xlink:href="#arrow-next-big"></svg>';
      this.input = document.createElement('div');
      this.input.className = "date-picker-input";
      this.input.innerHTML = inner;
      this.setValue();
      this.prev = this.input.children[0];
      this.input.children[1].addEventListener('click', function() {
        if (self.input.className.indexOf('open') !== -1) {
          self.input.className = "date-picker-input";
        } else {
          self.input.className = "date-picker-input open";
        }
      });
      this.prev.addEventListener('click', function() {
        self.onPrevClick();
      });
      this.next = this.input.children[2];
      this.next.addEventListener('click', function() {
        self.onNextClick();
      });
      this.updateUIControls();
    };
  
    PickerControls.prototype.updateUIControls = function() {
      //Hiding previous button if at the min value
      if (this.testMin()) {
        this.prev.setAttribute("class", "date-picker-global-increment prev disabled");
        this.prev.isDisabled = true;
        //Hiding next button if at the max value
      } else if (this.testMax()) {
        this.next.setAttribute("class", "date-picker-global-increment next disabled");
        this.next.isDisabled = true;
        //Else making sure button is visible
      } else {
        if (this.min_value !== undefined) {
          this.prev.setAttribute("class", "date-picker-global-increment prev");
          this.prev.isDisabled = false;
        }
        if (this.max_value !== undefined) {
          this.next.setAttribute("class", "date-picker-global-increment next");
          this.next.isDisabled = false;
        }
      }
    };
  
  
  
    /**
     * @override
     **/
    PickerControls.prototype.testMin = function() {
      switch (this.scale) {
        case PickerControls.prototype.enum.day:
          return this.min_date !== undefined && this.min_date === this.date;
        case PickerControls.prototype.enum.week:
          return this.min_date !== undefined &&
            DateUtils.getWeekFALDays(this.min_date).end >= DateUtils.getWeekFALDays(this.date).start;
        case PickerControls.prototype.enum.month:
          return this.min_date !== undefined &&
            this.min_date.getUTCFullYear() === this.date.getUTCFullYear() && this.min_date.getUTCMonth() === this.date.getUTCMonth();
        case PickerControls.prototype.enum.year:
          return this.min_date !== undefined && this.min_date.getUTCFullYear() === this.date.getUTCFullYear();
      }
    };
  
    /**
     * @override
     **/
    PickerControls.prototype.testMax = function() {
      switch (this.scale) {
        case PickerControls.prototype.enum.day:
          return this.min_date !== undefined && this.min_date === this.date;
        case PickerControls.prototype.enum.week:
          return this.max_date !== undefined &&
            DateUtils.getWeekFALDays(this.max_date).start <= DateUtils.getWeekFALDays(this.date).end;
        case PickerControls.prototype.enum.month:
          return this.max_date !== undefined &&
            this.max_date.getUTCFullYear() === this.date.getUTCFullYear() && this.max_date.getUTCMonth() === this.date.getUTCMonth();
        case PickerControls.prototype.enum.year:
          return this.max_date !== undefined && this.max_date.getUTCFullYear() === this.date.getUTCFullYear();
      }
    };
  
    /**
     * @override
     **/
    PickerControls.prototype.onPrevClick = function(commit) {
      if (this.prev.isDisabled === true) {
        return;
      }
      var e = {};
      e.commit = commit === undefined || commit === true;
      switch (this.scale) {
        case PickerControls.prototype.enum.scales.day:
          this.emit(this.mediation.events.emit.decday, e);
          break;
        case PickerControls.prototype.enum.scales.week:
          this.emit(this.mediation.events.emit.decweek, e);
          break;
        case PickerControls.prototype.enum.scales.month:
          this.emit(this.mediation.events.emit.decmonth, e);
          break;
        case PickerControls.prototype.enum.scales.year:
          this.emit(this.mediation.events.emit.decyear, e);
          break;
      }
    };
  
    /**
     * @override
     **/
    PickerControls.prototype.onNextClick = function(commit) {
      if (this.next.isDisabled === true) {
        return;
      }
      var e = {};
      e.commit = commit === undefined || commit === true;
      switch (this.scale) {
        case PickerControls.prototype.enum.scales.day:
          this.emit(this.mediation.events.emit.incday, e);
          break;
        case PickerControls.prototype.enum.scales.week:
          this.emit(this.mediation.events.emit.incweek, e);
          break;
        case PickerControls.prototype.enum.scales.month:
          this.emit(this.mediation.events.emit.incmonth, e);
          break;
        case PickerControls.prototype.enum.scales.year:
          this.emit(this.mediation.events.emit.incyear, e);
          break;
      }
    };
  
    PickerControls.prototype.generateEvents = function() {
      this.mediation.events.emit.pcupdate = this._constructEventString(Events.scope.emit, Events.desc.update.pcs);
      this.mediation.events.emit.decday = this._constructEventString(Events.scope.emit, Events.desc.request.decrement.day);
      this.mediation.events.emit.decweek = this._constructEventString(Events.scope.emit, Events.desc.request.decrement.week);
      this.mediation.events.emit.decmonth = this._constructEventString(Events.scope.emit, Events.desc.request.decrement.month);
      this.mediation.events.emit.decyear = this._constructEventString(Events.scope.emit, Events.desc.request.decrement.year);
      this.mediation.events.emit.incday = this._constructEventString(Events.scope.emit, Events.desc.request.increment.day);
      this.mediation.events.emit.incweek = this._constructEventString(Events.scope.emit, Events.desc.request.increment.week);
      this.mediation.events.emit.incmonth = this._constructEventString(Events.scope.emit, Events.desc.request.increment.month);
      this.mediation.events.emit.incyear = this._constructEventString(Events.scope.emit, Events.desc.request.increment.year);
    };
  
    PickerControls.prototype.subscribe = function(parent) {
      if (parent !== undefined) {
        this.mediator.subscribe(this.mediation.events.emit.pcupdate, parent);
        this.mediator.subscribe(this.mediation.events.emit.decday, parent);
        this.mediator.subscribe(this.mediation.events.emit.decweek, parent);
        this.mediator.subscribe(this.mediation.events.emit.decmonth, parent);
        this.mediator.subscribe(this.mediation.events.emit.decyear, parent);
        this.mediator.subscribe(this.mediation.events.emit.incday, parent);
        this.mediator.subscribe(this.mediation.events.emit.incweek, parent);
        this.mediator.subscribe(this.mediation.events.emit.incmonth, parent);
        this.mediator.subscribe(this.mediation.events.emit.incyear, parent);
      }
    };
  
    /**
     * @override
     **/
    PickerControls.prototype.notify = function(e) {
      if (e.scope === Events.scope.broadcast) {
        switch (e.desc) {
          case Events.desc.update.controls:
          case Events.desc.update.global:
            if (e.data.min_date !== undefined && e.data.min_date instanceof Date &&
              (this.max_date === undefined || e.data.min_date < this.max_date)) {
              this.min_date = new Date(e.data.min_date.getUTCFullYear(), e.data.min_date.getUTCMonth(), e.data.min_date.getUTCDate());
            }
            if (e.data.max_date !== undefined && e.data.max_date instanceof Date &&
              (this.min_date === undefined || e.data.max_date > this.min_date)) {
              this.max_date = new Date(e.data.max_date.getUTCFullYear(), e.data.max_date.getUTCMonth(), e.data.max_date.getUTCDate());
            }
            if (e.data.scale !== undefined && PickerControls.prototype.enum.scales[e.data.scale] !== undefined) {
              this.scale = PickerControls.prototype.enum.scales[e.data.scale];
              this.setValue();
            }
            if (e.data.date !== undefined && e.data.date instanceof Date) {
              this.setValue(e.data.date);
            }
            this.updateUIControls();
            break;
          default:
            break;
        }
      }
      IncrementSlider.prototype.notify.call(this, e);
    };
  
    return PickerControls;
  })();
  var Partial = (function() {
  
    function Partial(options, parent) {
      //super()
      Colleague.call(this, options.mediator, Partial.prototype.component);
      //Scale for this instance
      this.scale = (options.scale && Partial.prototype.enum.scales[options.scale]) ?
        Partial.prototype.enum.scales[options.scale] :
        Partial.prototype.enum.scales.day;
      this.generateEvents();
      //Date that is modified by the user
      this.date = new Date(options.date.getUTCFullYear(), options.date.getUTCMonth(), options.date.getUTCDate());
  
      //Saved state in case of rollback
      this.prev_date = new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate());
  
  
  
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
        day: "day",
        week: "week",
        month: "month",
        year: "year"
      }
    };
  
    Partial.prototype.getHTML = function() {
      return this.html;
    };
  
    Partial.prototype.rollback = function() {
      this.date = new Date(this.prev_date.getUTCFullYear(), this.prev_date.getUTCMonth(), this.prev_date.getUTCDate());
      var date = new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate());
      this.emit(this.mediation.events.broadcast.pupdate, { date: date });
    };
  
    Partial.prototype.commit = function() {
      this.prev_date = new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate());
    };
  
    Partial.prototype.generateHTML = function(options) {
      switch (this.scale) {
        case Partial.prototype.enum.scales.day:
        case Partial.prototype.enum.scales.week:
          this.html = this.calendarPartialHTML(options);
          break;
        case Partial.prototype.enum.scales.month:
        case Partial.prototype.enum.scales.year:
          this.html = this.dialerPartialHTML(options);
          break;
        default:
          break;
      }
    };
  
    Partial.prototype.calendarPartialHTML = function(options) {
      var container = document.createElement('div'),
        wrapper = document.createElement('div');
      options.min_value = options.min_date;
      options.max_value = options.max_date;
      this.components.yinput = new YearIncrementSlider(options);
      this.components.minput = new MonthIncrementSlider(options);
      this.components.calendar = new Calendar(options);
  
      if (this.scale === Partial.prototype.enum.scales.day) {
        container.className = "date-picker-mode-day active";
        wrapper.className = "date-picker-content-wrapper";
      } else if (this.scale === Partial.prototype.enum.scales.week) {
        container.className = "date-picker-mode-week active";
        wrapper.className = "date-picker-content-wrapper";
      }
  
      wrapper.appendChild(this.components.yinput.getHTML());
      wrapper.appendChild(this.components.minput.getHTML());
      wrapper.appendChild(this.components.calendar.getHTML());
      container.appendChild(wrapper);
      return container;
    };
  
    Partial.prototype.dialerPartialHTML = function(options) {
      var container = document.createElement('div'),
        wrapper = document.createElement('div');
      options.min_value = options.min_date;
      options.max_value = options.max_date;
  
      if (this.scale === Partial.prototype.enum.scales.month) {
        this.components.yinput = new YearIncrementSlider(options);
        this.components.mdialer = new Dialer(options);
        container.className = "date-picker-mode-month active";
        wrapper.className = "date-picker-content-wrapper";
        wrapper.appendChild(this.components.yinput.getHTML());
        wrapper.appendChild(this.components.mdialer.getHTML());
      } else if (this.scale === Partial.prototype.enum.scales.year) {
        options.value = "Financial Year";
        this.components.ydinput = new YDialerIncrementSlider(options);
        this.components.ydialer = new Dialer(options);
        container.className = "date-picker-mode-year active";
        wrapper.className = "date-picker-content-wrapper";
        wrapper.appendChild(this.components.ydinput.getHTML());
        wrapper.appendChild(this.components.ydialer.getHTML());
      }
  
      container.appendChild(wrapper);
      return container;
    };
  
    Partial.prototype.generateEvents = function() {
      switch (this.scale) {
        case Partial.prototype.enum.scales.day:
          //Targetted at the Calendar {scale=day} class
          this.mediation.events.broadcast.decday = this._constructEventString(Events.scope.broadcast, Events.desc.request.decrement.day);
          this.mediation.events.broadcast.incday = this._constructEventString(Events.scope.broadcast, Events.desc.request.increment.day);
          //Targetted at the MonthIncrementSlider class
          this.mediation.events.broadcast.decmonth = this._constructEventString(Events.scope.broadcast, Events.desc.request.decrement.month);
          this.mediation.events.broadcast.incmonth = this._constructEventString(Events.scope.broadcast, Events.desc.request.increment.month);
          //Targetted at the YearIncrementSlider class
          this.mediation.events.broadcast.decyear = this._constructEventString(Events.scope.broadcast, Events.desc.request.decrement.year);
          this.mediation.events.broadcast.incyear = this._constructEventString(Events.scope.broadcast, Events.desc.request.increment.year);
          //Updates
          this.mediation.events.broadcast.cupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.cal);
          this.mediation.events.broadcast.mupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.mis);
          this.mediation.events.broadcast.yupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.yis);
          break;
        case Partial.prototype.enum.scales.week:
          //Targetted at the Calendar {scale=week} class
          this.mediation.events.broadcast.decweek = this._constructEventString(Events.scope.broadcast, Events.desc.request.decrement.week);
          this.mediation.events.broadcast.incweek = this._constructEventString(Events.scope.broadcast, Events.desc.request.increment.week);
          //Updates
          this.mediation.events.broadcast.cupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.cal);
          this.mediation.events.broadcast.mupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.mis);
          this.mediation.events.broadcast.yupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.yis);
          break;
        case Partial.prototype.enum.scales.month:
          this.mediation.events.broadcast.dupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.mdi);
          this.mediation.events.broadcast.yupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.yis);
          break;
        case Partial.prototype.enum.scales.year:
          this.mediation.events.broadcast.dupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.ydi);
          this.mediation.events.broadcast.ydupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.yds);
          break;
        default:
          break;
      }
      this.mediation.events.emit.commit = this._constructEventString(Events.scope.emit, Events.desc.commit);
      this.mediation.events.broadcast.pupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.partial);
      this.mediation.events.emit.pupdate = this._constructEventString(Events.scope.emit, Events.desc.update[this.scale]);
    };
  
    Partial.prototype.subscribe = function(parent) {
      if (parent !== undefined) {
        this.mediator.subscribe(this.mediation.events.emit.commit, parent);
        this.mediator.subscribe(this.mediation.events.emit.pupdate, parent);
      }
      switch (this.scale) {
        case Partial.prototype.enum.scales.day:
          this.subscribeDay();
          break;
        case Partial.prototype.enum.scales.week:
          this.subscribeWeek();
          break;
        case Partial.prototype.enum.scales.month:
          this.subscribeMonth();
          break;
        case Partial.prototype.enum.scales.year:
          this.subscribeYear();
          break;
        default:
          break;
      }
    };
  
    Partial.prototype.subscribeDay = function() {
      this.mediator.subscribe(this.mediation.events.broadcast.decyear, this.components.yinput);
      this.mediator.subscribe(this.mediation.events.broadcast.incyear, this.components.yinput);
      this.mediator.subscribe(this.mediation.events.broadcast.decmonth, this.components.minput);
      this.mediator.subscribe(this.mediation.events.broadcast.incmonth, this.components.minput);
      this.mediator.subscribe(this.mediation.events.broadcast.decday, this.components.calendar);
      this.mediator.subscribe(this.mediation.events.broadcast.incday, this.components.calendar);
      this.mediator.subscribe(this.mediation.events.broadcast.pupdate, this.components.yinput);
      this.mediator.subscribe(this.mediation.events.broadcast.pupdate, this.components.minput);
      this.mediator.subscribe(this.mediation.events.broadcast.pupdate, this.components.calendar);
      this.mediator.subscribe(this.mediation.events.broadcast.yupdate, this.components.yinput);
      this.mediator.subscribe(this.mediation.events.broadcast.mupdate, this.components.minput);
      this.mediator.subscribe(this.mediation.events.broadcast.cupdate, this.components.calendar);
      this.components.yinput.subscribe(this);
      this.components.minput.subscribe(this);
      this.components.calendar.subscribe(this);
    };
  
    Partial.prototype.subscribeWeek = function() {
      this.mediator.subscribe(this.mediation.events.broadcast.decweek, this.components.calendar);
      this.mediator.subscribe(this.mediation.events.broadcast.incweek, this.components.calendar);
      this.mediator.subscribe(this.mediation.events.broadcast.pupdate, this.components.yinput);
      this.mediator.subscribe(this.mediation.events.broadcast.pupdate, this.components.minput);
      this.mediator.subscribe(this.mediation.events.broadcast.pupdate, this.components.calendar);
      this.mediator.subscribe(this.mediation.events.broadcast.yupdate, this.components.yinput);
      this.mediator.subscribe(this.mediation.events.broadcast.mupdate, this.components.minput);
      this.mediator.subscribe(this.mediation.events.broadcast.cupdate, this.components.calendar);
      this.components.yinput.subscribe(this);
      this.components.minput.subscribe(this);
      this.components.calendar.subscribe(this);
    };
  
    Partial.prototype.subscribeMonth = function() {
      this.mediator.subscribe(this.mediation.events.broadcast.pupdate, this.components.yinput);
      this.mediator.subscribe(this.mediation.events.broadcast.pupdate, this.components.mdialer);
      this.mediator.subscribe(this.mediation.events.broadcast.yupdate, this.components.yinput);
      this.mediator.subscribe(this.mediation.events.broadcast.dupdate, this.components.mdialer);
      this.components.yinput.subscribe(this);
      this.components.mdialer.subscribe(this);
    };
  
    Partial.prototype.subscribeYear = function() {
      this.mediator.subscribe(this.mediation.events.broadcast.pupdate, this.components.ydinput);
      this.mediator.subscribe(this.mediation.events.broadcast.pupdate, this.components.ydialer);
      this.mediator.subscribe(this.mediation.events.broadcast.ydupdate, this.components.ydinput);
      this.mediator.subscribe(this.mediation.events.broadcast.dupdate, this.components.ydialer);
      this.components.ydinput.subscribe(this);
      this.components.ydialer.subscribe(this);
    };
  
    /**
     * @override
     **/
    Partial.prototype.notify = function(e) {
      this.forward(e);
      if (e.scope === Events.scope.broadcast) {
        if (e.data.min_date !== undefined && e.data.date instanceof Date) {
          this.min_date = new Date(e.data.min_date.getUTCFullYear(), e.data.min_date.getUTCMonth(), e.data.min_date.getUTCDate());
        }
        if (e.data.max_date !== undefined && e.data.date instanceof Date) {
          this.max_date = new Date(e.data.max_date.getUTCFullYear(), e.data.max_date.getUTCMonth(), e.data.max_date.getUTCDate());
        }
      }
  
      if (e.data.date !== undefined && e.data.date instanceof Date) {
        this.date = new Date(e.data.date.getUTCFullYear(), e.data.date.getUTCMonth(), e.data.date.getUTCDate());
      }
  
      this.constructor.prototype.notify.call(this, e);
    };
  
    Partial.prototype.forward = function(e) {
      if (e.scope === Events.scope.emit) {
        if (e.desc === Events.desc.commit) {
          this.emit(this.mediation.events.emit.commit, e.data);
        } else {
          switch (this.scale) {
            case Partial.prototype.enum.scales.day:
            case Partial.prototype.enum.scales.week:
              switch (e.desc) {
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
                default:
                  break;
              }
              break;
            case Partial.prototype.enum.scales.month:
              switch (e.desc) {
                case Events.desc.update.mdi:
                  this.emit(this.mediation.events.broadcast.yupdate, e.data);
                  break;
                case Events.desc.update.yis:
                  this.emit(this.mediation.events.broadcast.dupdate, e.data);
                  break;
                default:
                  break;
              }
              break;
            case Partial.prototype.enum.scales.year:
              switch (e.desc) {
                case Events.desc.update.ydi:
                  this.emit(this.mediation.events.broadcast.ydupdate, e.data);
                  break;
                case Events.desc.update.yds:
                  this.emit(this.mediation.events.broadcast.dupdate, e.data);
                  break;
                default:
                  break;
              }
              break;
            default:
              break;
          }
          this.emit(this.mediation.events.emit.pupdate, e.data);
        }
      } else if (e.scope === Events.scope.broadcast) {
        switch (e.desc) {
          case Events.desc.commit:
            this.commit();
            break;
          case Events.desc.rollback:
            this.rollback();
            break;
          case Events.desc.request.increment.day:
            this.emit(this.mediation.events.broadcast.incday, e.data);
            break;
          case Events.desc.request.increment.week:
            this.emit(this.mediation.events.broadcast.incweek, e.data);
            break;
          case Events.desc.request.increment.month:
            this.emit(this.mediation.events.broadcast.incmonth, e.data);
            break;
          case Events.desc.request.increment.year:
            this.emit(this.mediation.events.broadcast.incyear, e.data);
            break;
          case Events.desc.request.decrement.day:
            this.emit(this.mediation.events.broadcast.decday, e.data);
            break;
          case Events.desc.request.decrement.week:
            this.emit(this.mediation.events.broadcast.decweek, e.data);
            break;
          case Events.desc.request.decrement.month:
            this.emit(this.mediation.events.broadcast.decmonth, e.data);
            break;
          case Events.desc.request.decrement.year:
            this.emit(this.mediation.events.broadcast.decyear, e.data);
            break;
          default:
            this.emit(this.mediation.events.broadcast.pupdate, e.data);
            break;
        }
      }
    };
  
    return Partial;
  })();

  function DatePicker(options) {
    //super()
    Colleague.call(this, new Mediator(), DatePicker.prototype.component);
    this.generateEvents();

    if (options === undefined) {
      options = this.deepCopyObject(DatePicker.prototype.defaults);
    } else {
      options = Object.assign(this.deepCopyObject(DatePicker.prototype.defaults), this.deepCopyObject(options));
    }
    options.mediator = this.mediator;
    this.context = options.parent;

    this.scale = (options.scale !== undefined && DatePicker.prototype.enum.scales[options.scale] !== undefined) ?
      options.scale : DatePicker.prototype.defaults.scale;

    this.min_date = options.min_date instanceof Date ?
      options.min_date :
      undefined;
    this.max_date = options.max_date instanceof Date && options.max_date > this.min_date ?
      options.max_date :
      undefined;

    this.date = options.date instanceof Date && options.date >= this.min_date && options.date <= this.max_date ?
      options.date : undefined;

    if (this.date === undefined) {
      if (this.max_date) {
        this.date = new Date(this.max_date.getUTCFullYear(), this.max_date.getUTCMonth(), this.max_date.getUTCDate());
        options.date = new Date(this.max_date.getUTCFullYear(), this.max_date.getUTCMonth(), this.max_date.getUTCDate());
      } else if (this.min_date) {
        this.date = new Date(this.min_date.getUTCFullYear(), this.min_date.getUTCMonth(), this.min_date.getUTCDate());
        options.date = new Date(this.min_date.getUTCFullYear(), this.min_date.getUTCMonth(), this.min_date.getUTCDate());
      } else {
        this.date = new Date();
        options.date = new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate());
      }
    }
    this.prev_date = new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate());

    this.lang = options.lang !== undefined &&
      DatePicker.prototype.enum.languages[options.lang] !== undefined ?
      DatePicker.prototype.enum.languages[options.lang] : 'en';

    //Setting up the controls
    this.controls = new PickerControls(options);

    //Setting up the partials
    this.partials = {};
    options.value = options.date;
    options.scale = DatePicker.prototype.enum.scales.day;
    this.partials.day = new Partial(options);
    options.scale = DatePicker.prototype.enum.scales.week;
    this.partials.week = new Partial(options);
    options.scale = DatePicker.prototype.enum.scales.month;
    this.partials.month = new Partial(options);
    options.scale = DatePicker.prototype.enum.scales.year;
    this.partials.year = new Partial(options);

    //Subscribe all partials to global events
    this.subscribe();
    //Generating markup and appending to DOM
    this.generateSVG(options.icons);
    this.generateHTML();

    this.patchSVGURLs();
  }

  //Binding the prototype of the Parent object
  //Properties will be overriden on this one.
  DatePicker.prototype = Object.create(Colleague.prototype);

  //Binding the constructor to the prototype
  DatePicker.prototype.constructor = Colleague;

  //Binding all Types to the namespace (for retrieval by external programmers)
  DatePicker.prototype.Partial = Partial;
  DatePicker.prototype.Calendar = Calendar;
  DatePicker.prototype.IncrementSlider = IncrementSlider;
  DatePicker.prototype.MonthIncrementSlider = MonthIncrementSlider;
  DatePicker.prototype.YearIncrementSlider = YearIncrementSlider;
  DatePicker.prototype.Colleague = Colleague;
  DatePicker.prototype.Mediator = Mediator;
  DatePicker.prototype.DateUtils = DateUtils;
  DatePicker.prototype.NumberUtils = NumberUtils;
  DatePicker.prototype.UUIDUtils = UUIDUtils;

  DatePicker.prototype.component = 'DATEPICKER';

  DatePicker.prototype.defaults = {
    date: new Date(),
    scale: "day",
    icons: {
      "arrow-prev-big": '<svg><symbol id="arrow-prev-big"><rect fill="none" x="0" y="0" width="30" height="30" height="30"/><polygon points="18,23.2 9.3,15.5 18,7.8 "/></symbol></svg>',
      "arrow-next-big": '<svg><symbol id="arrow-next-big"><use transform="translate(30,0) scale(-1,1)" xlink:href="#arrow-prev-big" /></svg>',
      "arrow-prev-small": '<svg><symbol id="arrow-prev-small"><rect fill="none" width="20" height="20"/><polygon points="12,16.2 5.3,10.3 12,4.4 "/></symbol></svg>',
      "arrow-next-small": '<svg></symbol><symbol id="arrow-next-small"><use transform="translate(20,0) scale(-1,1)" xlink:href="#arrow-prev-small" /></symbol></svg>'
    },
    parent: 'body',
    lang: 'en'
  };

  DatePicker.prototype.enum = {
    scales: {
      day: "day",
      week: "week",
      month: "month",
      year: "year"
    },
    languages: {
      en: 'en',
      fr: 'fr'
    },
    callbacks: {
      dateUpdate: 'dateUpdate',
      minDateUpdate: 'minDateUpdate',
      maxDateUpdate: 'maxDateUpdate',
      scaleUpdate: 'scaleUpdate',
      notify: 'notify',
      emit: 'emit',
      commit: 'commit',
      rollback: 'rollback'
    },
    components: {
      partials: {
        day: "DAYPARTIAL",
        week: "WEEKPARTIAL",
        month: "MONTHPARTIAL",
        year: "YEARPARTIAL"
      },
      sub: {
        day: {
          mis: "DAYMIS",
          yis: "DAYYIS",
          cal: "DAYCAL",
        },
        week: {
          mis: "WEEKMIS",
          yis: "WEEKYIS",
          cal: "WEEKCAL",
        },
        month: {
          yis: "MONTHYIS",
          mdi: "MONTHDIALER",
        },
        year: {
          yds: "YDIALERIS",
          ydi: "YEARDIALER",
        },
        controls: {
          pcs: "PICKERCONTROLS"
        }
      }
    }
  };

  DatePicker.prototype.getAPI = function() {
    var self = this;
    return {
      getDate: function() {
        return self.getDate();
      },
      setDate: function(date) {
        self.setDate(date);
      },
      incrementDate: function(commit) {
        return self.incrementDate(commit);
      },
      decrementDate: function(commit) {
        return self.decrementDate(commit);
      },
      getMinDate: function() {
        return self.getMinDate();
      },
      setMinDate: function(date) {
        self.setMinDate(date);
      },
      getMaxDate: function() {
        return self.getMaxDate();
      },
      setMaxDate: function(date) {
        self.setMaxDate(date);
      },
      getPeriod: function() {
        return self.getPeriod();
      },
      getScales: function() {
        return self.getScales();
      },
      getScale: function() {
        return self.getScale();
      },
      changeScale: function(scale) {
        self.changeScale(scale);
      },
      addEventListener: function(e, c) {
        self.addEventListener(e, c);
      },
      getHTML: function() {
        return self.getHTML();
      },
      getComponents: function() {
        return self.getComponents();
      },
      getComponent: function(comp) {
        return self.getComponent(comp);
      },
      commit: function() {
        self.commit();
      },
      rollback: function() {
        self.rollback();
      },
      patchSVGURLs: function() {
        self.patchSVGURLs();
      }
    };
  };

  DatePicker.prototype.getDate = function() {
    return new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate());
  };

  DatePicker.prototype.setDate = function(date) {
    if (date !== undefined && date instanceof Date &&
      (this.min_date === undefined || date >= this.min_date) &&
      (this.max_date === undefined || date <= this.max_date)) {
      this.date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      this.emit(this.mediation.events.broadcast.gupdate, { date: date });
      this.callCallback(DatePicker.prototype.enum.callbacks.dateUpdate, date);
      return true;
    }
    return false;
  };

  DatePicker.prototype.incrementDate = function(commit) {
    commit = commit === undefined ? false : !!commit;
    this.controls.onNextClick(commit);
  };

  DatePicker.prototype.decrementDate = function(commit) {
    commit = commit === undefined ? false : !!commit;
    this.controls.onPrevClick(commit);
  };

  DatePicker.prototype.getMinDate = function() {
    if (this.min_date === undefined) return undefined;
    return new Date(this.min_date.getUTCFullYear(), this.min_date.getUTCMonth(), this.min_date.getUTCDate());
  };

  DatePicker.prototype.setMinDate = function(date) {
    if (date !== undefined && date instanceof Date && (this.max_date === undefined || date < this.max_date)) {
      this.min_date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      this.emit(this.mediation.events.broadcast.gupdate, { min_date: date });
      if (this.date < this.min_date) {
        this.setDate(this.min_date);
      }
      this.callCallback(DatePicker.prototype.enum.callbacks.minDateUpdate, date);
      return true;
    }
    return false;
  };

  DatePicker.prototype.getMaxDate = function() {
    if (this.max_date === undefined) return undefined;
    return new Date(this.max_date.getUTCFullYear(), this.max_date.getUTCMonth(), this.max_date.getUTCDate());
  };

  DatePicker.prototype.setMaxDate = function(date) {
    if (date !== undefined && date instanceof Date && (this.min_date === undefined || date > this.min_date)) {
      this.max_date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      this.emit(this.mediation.events.broadcast.gupdate, { max_date: date });
      if (this.date > this.max_date) {
        this.setDate(this.max_date);
      }
      this.callCallback(DatePicker.prototype.enum.callbacks.maxDateUpdate, date);
      return true;
    }
    return false;
  };

  DatePicker.prototype.getPeriod = function() {
    var period = {};
    switch (this.scale) {
      case DatePicker.prototype.enum.scales.day:
        period.date = this.getDate();
        break;
      case DatePicker.prototype.enum.scales.week:
        period = DateUtils.getWeekFALDays(this.date);
        period.start = this.min_date !== undefined && period.start.getTime() < this.min_date.getTime() ? this.getMinDate() : period.start;
        period.end = this.max_date !== undefined && period.end.getTime() > this.max_date.getTime() ? this.getMaxDate() : period.end;
        break;
      case DatePicker.prototype.enum.scales.month:
        period.start = this.getDate();
        period.start.setUTCDate(1);
        period.end = this.getDate();
        period.end.setUTCDate(DateUtils.daysInMonth(period.end.getUTCFullYear(), period.end.getUTCMonth()));
        period.start = this.min_date !== undefined && period.start.getTime() < this.min_date.getTime() ? this.getMinDate() : period.start;
        period.end = this.max_date !== undefined && period.end.getTime() > this.max_date.getTime() ? this.getMaxDate() : period.end;
        break;
      case DatePicker.prototype.enum.scales.year:
        period.start = this.getDate();
        period.start.setUTCMonth(0);
        period.start.setUTCDate(1);
        period.end = this.getDate();
        period.end.setUTCMonth(11);
        period.end.setUTCDate(31);
        period.start = this.min_date !== undefined && period.start.getTime() < this.min_date.getTime() ? this.getMinDate() : period.start;
        period.end = this.max_date !== undefined && period.end.getTime() > this.max_date.getTime() ? this.getMaxDate() : period.end;
        break;
    }
    return period;
  };

  DatePicker.prototype.getScales = function() {
    return DatePicker.prototype.enum.scales;
  };

  DatePicker.prototype.getScale = function() {
    return this.scale;
  };

  DatePicker.prototype.changeScale = function(scale) {
    this.scale = DatePicker.prototype.enum.scales[scale] === undefined ?
      DatePicker.prototype.enum.scales.day : DatePicker.prototype.enum.scales[scale];
    this.body.removeChild(this.body.children[0]);
    this.body.appendChild(this.partials[this.scale].getHTML());
    this.callCallback(DatePicker.prototype.enum.callbacks.scaleUpdate, scale);
  };

  DatePicker.prototype.getHTML = function() {
    return this.html;
  };

  DatePicker.prototype.getComponents = function() {
    return DatePicker.prototype.enum.components;
  };

  DatePicker.prototype.getComponent = function(comp) {
    switch (comp) {
      case DatePicker.prototype.enum.components.partials.day:
        return this.partials[DatePicker.prototype.enum.scales.day];
      case DatePicker.prototype.enum.components.partials.week:
        return this.partials[DatePicker.prototype.enum.scales.week];
      case DatePicker.prototype.enum.components.partials.month:
        return this.partials[DatePicker.prototype.enum.scales.month];
      case DatePicker.prototype.enum.components.partials.year:
        return this.partials[DatePicker.prototype.enum.scales.year];
      case DatePicker.prototype.enum.components.sub.day.mis:
        return this.partials[DatePicker.prototype.enum.scales.day].components.minput;
      case DatePicker.prototype.enum.components.sub.day.yis:
        return this.partials[DatePicker.prototype.enum.scales.day].components.yinput;
      case DatePicker.prototype.enum.components.sub.day.cal:
        return this.partials[DatePicker.prototype.enum.scales.day].components.calendar;
      case DatePicker.prototype.enum.components.sub.week.yis:
        return this.partials[DatePicker.prototype.enum.scales.week].components.minput;
      case DatePicker.prototype.enum.components.sub.week.mis:
        return this.partials[DatePicker.prototype.enum.scales.week].components.yinput;
      case DatePicker.prototype.enum.components.sub.week.cal:
        return this.partials[DatePicker.prototype.enum.scales.week].components.calendar;
      case DatePicker.prototype.enum.components.sub.month.yis:
        return this.partials[DatePicker.prototype.enum.scales.month].components.yinput;
      case DatePicker.prototype.enum.components.sub.month.mdi:
        return this.partials[DatePicker.prototype.enum.scales.month].components.mdialer;
      case DatePicker.prototype.enum.components.sub.year.yds:
        return this.partials[DatePicker.prototype.enum.scales.year].components.ydinput;
      case DatePicker.prototype.enum.components.sub.year.ydi:
        return this.partials[DatePicker.prototype.enum.scales.year].components.ydialer;
      case DatePicker.prototype.enum.components.sub.controls.pcs:
        return this.controls;
      default:
        return undefined;
    }
  };

  DatePicker.prototype.addEventListener = function(e, callback) {
    if (typeof e === "string") {
      for (var key in DatePicker.prototype.enum.callbacks) {
        if (e === key) {
          this.registerCallback(e, callback);
          break;
        }
      }
    } else {
      throw new Error('Illegal Argument: addEventListener takes a string as first parameter');
    }
  };

  DatePicker.prototype.commit = function() {
    var date = new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate());
    this.prev_date = new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate());
    this.emit(this.mediation.events.broadcast.commit, {});
    this.callCallback(DatePicker.prototype.enum.callbacks.commit, date);
  };

  DatePicker.prototype.rollback = function() {
    var date = new Date(this.prev_date.getUTCFullYear(), this.prev_date.getUTCMonth(), this.prev_date.getUTCDate());
    this.date = new Date(this.prev_date.getUTCFullYear(), this.prev_date.getUTCMonth(), this.prev_date.getUTCDate());
    this.emit(this.mediation.events.broadcast.rollback, {});
    this.callCallback(DatePicker.prototype.enum.callbacks.rollback, date);
  };

  DatePicker.prototype.generateHTML = function() {
    var self = this,
      callback = function(e) {
        self.onModeBtnClick(e.target);
      };
    var datepicker = document.createElement('div');
    datepicker.className = "date-picker";

    var content = document.createElement('div');
    content.className = "date-picker-content";

    var moderow = document.createElement('div');
    moderow.className = "date-picker-mode-button-row";

    var button;
    for (var key in DatePicker.prototype.enum.scales) {
      button = document.createElement('span');
      button.scale = key;
      button.innerHTML = key.charAt(0).toUpperCase() + key.slice(1);
      button.addEventListener('click', callback);
      if (this.scale === key) {
        moderow.current = button;
        button.className = "date-picker-mode-button active";
      } else {
        button.className = "date-picker-mode-button";
      }
      moderow.appendChild(button);
    }

    var body = document.createElement('div');
    body.className = "date-picker-body";
    body.appendChild(this.partials[this.scale].getHTML());

    content.appendChild(moderow);
    content.appendChild(body);

    document.addEventListener('click', function(e) {
      var isChild = false,
        node = e.target;
      while (node !== null) {
        if (node == datepicker) {
          isChild = true;
        }
        node = node.parentNode;
      }
      var html = self.controls.getHTML();
      if (!isChild && html.className !== "date-picker-input") {
        html.className = "date-picker-input";
        self.commit();
      }
    });

    datepicker.appendChild(this.controls.getHTML());
    datepicker.appendChild(content);

    this.html = datepicker;
    this.body = body;

    //Appending HTML to options.parent
    var parent;
    if (typeof this.context === "string") {
      parent = document.querySelector(this.context);
      parent.appendChild(this.html);
    } else if (this.context.nodeType !== undefined) {
      parent = this.context;
      parent.appendChild(this.html);
    }
  };

  DatePicker.prototype.onModeBtnClick = function(span) {
    var buttons = this.html.children[1].children[0];
    buttons.current.className = "date-picker-mode-button";
    buttons.current = span;
    this.changeScale(span.scale);
    this.emit(this.mediation.events.broadcast.pcupdate, { scale: span.scale });
    buttons.current.className = "date-picker-mode-button active";
  };

  /**
   * Initializes the SVG icons for the DatePicker
   * @param options <Object> List of options for the DatePicker
   **/
  DatePicker.prototype.generateSVG = function(icons) {
    //If icons are already set, return
    if (document.querySelector("svg#dp-icons")) {
      return document.querySelector("svg#dp-icons");
    }
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
      idsmall = ['arrow-prev-small', 'arrow-next-small'],
      idbig = ['arrow-prev-big', 'arrow-next-big'];
    svg.id = "dp-icons";
    svg.style.display = "none";
    this.svg = svg;

    this._initIcons(idbig, icons);
    this._initIcons(idsmall, icons);
    document.querySelector('body').appendChild(svg);
    return svg;
  };

  DatePicker.prototype._initIcons = function(ids, icons) {
    var valid = false;
    var id;
    var elements = [],
      element;
    if (icons !== undefined) {
      valid = true;
      for (var i = 0; i < ids.length; i++) {
        id = ids[i];
        //Verifies if the icons passed are HTMLElements
        try {
          if (typeof icons[id] === "string") {
            element = document.createElement('div');
            element.innerHTML = icons[id];
            element = element.firstChild;
            element.id = id;
            elements.push(element);
          } else if (icons[id].nodeType !== undefined) {
            elements.push(icons[id]);
          } else {
            throw new Error("Illegal argument: Icons passed in option.icons are not HTML string nor HTMLElements. Falling back to base icons for the group of icons " + ids.toString() + ".");
          }
        } catch (e) {
          valid = false;
          console.error(e);
        }
      }
    }

    if (!valid) {
      for (var j = 0; j < ids.length; j++) {
        id = ids[j];
        element = document.createElement('svg');
        element.innerHTML = DatePicker.prototype.defaults.icons[id];
        element = element.firstChild.firstChild;
        this.svg.appendChild(element);
      }
    } else {
      for (var k = 0; k < elements.length; k++) {
        this.svg.appendChild(elements[k]);
      }
    }
  };

  //Fixes references to inline SVG elements when the <base> tag is in use.
  //Related to http://stackoverflow.com/a/18265336/796152
  //https://gist.github.com/leonderijke/c5cf7c5b2e424c0061d2
  DatePicker.prototype.patchSVGURLs = function() {
    if (document.querySelector("base")) {
      var baseUrl = window.location.href
        .replace(window.location.hash, "");
      [].slice.call(document.querySelectorAll("use[*|href]"))
        .filter(function(element) {
          return (element.getAttribute("xlink:href").indexOf("#") === 0);
        })
        .forEach(function(element) {
          element.setAttribute("xlink:href", baseUrl + element.getAttribute("xlink:href"));
        });
    }
  };

  DatePicker.prototype.generateEvents = function() {
    //Commit & rollback
    this.mediation.events.broadcast.commit = this._constructEventString(Events.scope.broadcast, Events.desc.commit);
    this.mediation.events.broadcast.rollback = this._constructEventString(Events.scope.broadcast, Events.desc.rollback);
    //Updates
    this.mediation.events.broadcast.dupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.day);
    this.mediation.events.broadcast.wupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.week);
    this.mediation.events.broadcast.mupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.month);
    this.mediation.events.broadcast.yupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.year);
    this.mediation.events.broadcast.pcupdate = this._constructEventString(Events.scope.broadcast, Events.desc.update.controls);
    //Requests
    this.mediation.events.broadcast.decday = this._constructEventString(Events.scope.broadcast, Events.desc.request.decrement.day);
    this.mediation.events.broadcast.decweek = this._constructEventString(Events.scope.broadcast, Events.desc.request.decrement.week);
    this.mediation.events.broadcast.decmonth = this._constructEventString(Events.scope.broadcast, Events.desc.request.decrement.month);
    this.mediation.events.broadcast.decyear = this._constructEventString(Events.scope.broadcast, Events.desc.request.decrement.year);
    this.mediation.events.broadcast.incday = this._constructEventString(Events.scope.broadcast, Events.desc.request.increment.day);
    this.mediation.events.broadcast.incweek = this._constructEventString(Events.scope.broadcast, Events.desc.request.increment.week);
    this.mediation.events.broadcast.incmonth = this._constructEventString(Events.scope.broadcast, Events.desc.request.increment.month);
    this.mediation.events.broadcast.incyear = this._constructEventString(Events.scope.broadcast, Events.desc.request.increment.year);
  };

  DatePicker.prototype.subscribe = function() {
    //Commit & rollback
    this.mediator.subscribe(this.mediation.events.broadcast.commit, this.partials.day);
    this.mediator.subscribe(this.mediation.events.broadcast.commit, this.partials.week);
    this.mediator.subscribe(this.mediation.events.broadcast.commit, this.partials.month);
    this.mediator.subscribe(this.mediation.events.broadcast.commit, this.partials.year);
    this.mediator.subscribe(this.mediation.events.broadcast.rollback, this.partials.day);
    this.mediator.subscribe(this.mediation.events.broadcast.rollback, this.partials.week);
    this.mediator.subscribe(this.mediation.events.broadcast.rollback, this.partials.month);
    this.mediator.subscribe(this.mediation.events.broadcast.rollback, this.partials.year);
    //Updates
    this.mediator.subscribe(this.mediation.events.broadcast.gupdate, this.partials.day);
    this.mediator.subscribe(this.mediation.events.broadcast.gupdate, this.partials.week);
    this.mediator.subscribe(this.mediation.events.broadcast.gupdate, this.partials.month);
    this.mediator.subscribe(this.mediation.events.broadcast.gupdate, this.partials.year);
    this.mediator.subscribe(this.mediation.events.broadcast.dupdate, this.partials.day);
    this.mediator.subscribe(this.mediation.events.broadcast.wupdate, this.partials.week);
    this.mediator.subscribe(this.mediation.events.broadcast.mupdate, this.partials.month);
    this.mediator.subscribe(this.mediation.events.broadcast.yupdate, this.partials.year);
    this.mediator.subscribe(this.mediation.events.broadcast.gupdate, this.controls);
    this.mediator.subscribe(this.mediation.events.broadcast.pcupdate, this.controls);
    //Requests
    this.mediator.subscribe(this.mediation.events.broadcast.decday, this.partials.day);
    this.mediator.subscribe(this.mediation.events.broadcast.decweek, this.partials.week);
    this.mediator.subscribe(this.mediation.events.broadcast.decmonth, this.partials.day);
    this.mediator.subscribe(this.mediation.events.broadcast.decyear, this.partials.day);
    this.mediator.subscribe(this.mediation.events.broadcast.incday, this.partials.day);
    this.mediator.subscribe(this.mediation.events.broadcast.incweek, this.partials.week);
    this.mediator.subscribe(this.mediation.events.broadcast.incmonth, this.partials.day);
    this.mediator.subscribe(this.mediation.events.broadcast.incyear, this.partials.day);

    this.partials.day.subscribe(this);
    this.partials.week.subscribe(this);
    this.partials.month.subscribe(this);
    this.partials.year.subscribe(this);
    this.controls.subscribe(this);
  };

  /**
   * @override
   **/
  DatePicker.prototype.notify = function(e) {
    if (e.scope === Events.scope.emit) {
      switch (e.desc) {
        //Updates
        case Events.desc.update.day:
          this.emit(this.mediation.events.broadcast.wupdate, e.data);
          this.emit(this.mediation.events.broadcast.mupdate, e.data);
          this.emit(this.mediation.events.broadcast.yupdate, e.data);
          this.emit(this.mediation.events.broadcast.pcupdate, e.data);
          break;
        case Events.desc.update.week:
          this.emit(this.mediation.events.broadcast.dupdate, e.data);
          this.emit(this.mediation.events.broadcast.mupdate, e.data);
          this.emit(this.mediation.events.broadcast.yupdate, e.data);
          this.emit(this.mediation.events.broadcast.pcupdate, e.data);
          break;
        case Events.desc.update.month:
          this.emit(this.mediation.events.broadcast.dupdate, e.data);
          this.emit(this.mediation.events.broadcast.wupdate, e.data);
          this.emit(this.mediation.events.broadcast.yupdate, e.data);
          this.emit(this.mediation.events.broadcast.pcupdate, e.data);
          break;
        case Events.desc.update.year:
          this.emit(this.mediation.events.broadcast.dupdate, e.data);
          this.emit(this.mediation.events.broadcast.wupdate, e.data);
          this.emit(this.mediation.events.broadcast.mupdate, e.data);
          this.emit(this.mediation.events.broadcast.pcupdate, e.data);
          break;
          //Requests
        case Events.desc.request.decrement.day:
          this.emit(this.mediation.events.broadcast.decday, e.data);
          break;
        case Events.desc.request.decrement.week:
          this.emit(this.mediation.events.broadcast.decweek, e.data);
          break;
        case Events.desc.request.decrement.month:
          this.emit(this.mediation.events.broadcast.decmonth, e.data);
          break;
        case Events.desc.request.decrement.year:
          this.emit(this.mediation.events.broadcast.decyear, e.data);
          break;
        case Events.desc.request.increment.day:
          this.emit(this.mediation.events.broadcast.incday, e.data);
          break;
        case Events.desc.request.increment.week:
          this.emit(this.mediation.events.broadcast.incweek, e.data);
          break;
        case Events.desc.request.increment.month:
          this.emit(this.mediation.events.broadcast.incmonth, e.data);
          break;
        case Events.desc.request.increment.year:
          this.emit(this.mediation.events.broadcast.incyear, e.data);
          break;
        case Events.desc.commit:
          this.commit();
          break;
        default:
          break;
      }
      if (e.data.date instanceof Date) {
        this.date = new Date(e.data.date.getUTCFullYear(), e.data.date.getUTCMonth(), e.data.date.getUTCDate());
        this.callCallback(DatePicker.prototype.enum.callbacks.dateUpdate, e.data.date);
      }
    }
    Colleague.prototype.notify.call(this, e);
  };

  DatePicker.prototype.deepCopyObject = function(options) {
    return deepCopyObject(options, {});
  };

  var deepCopyObject = function(object, copy) {
    for (var key in object) {
      if (typeof object[key] === "string" || typeof object[key] === "number" || typeof object[key] === "function") {
        copy[key] = object[key];
      } else if (typeof object[key] === "object" && object[key] !== null) {
        if (object[key] instanceof Date) {
          object[key].setHours(0, 0, 0, 0);
          copy[key] = new Date(object[key].getUTCFullYear(), object[key].getUTCMonth(), object[key].getUTCDate());
        } else if (object[key].nodeType !== undefined) {
          copy[key] = object[key];
        } else {
          copy[key] = deepCopyObject(object[key], {});
        }
      }
    }
    return copy;
  };

  window.DatePicker = DatePicker;
  return window.DatePicker;
})();