(function() {

  //=include ./events/events.js
  //=include ./events/mutex.js
  //=include ./events/colleague.js
  //=include ./events/mediator.js
  //=include ./utilities/date-utils.js
  //=include ./utilities/number-utils.js
  //=include ./utilities/uuid-utils.js
  //=include ./components/calendar/calendar.js
  //=include ./components/dialer/dialer.js
  //=include ./components/sliders/increment-slider.js
  //=include ./components/sliders/year-increment-slider.js
  //=include ./components/sliders/month-increment-slider.js
  //=include ./components/sliders/ydialer-increment-slider.js
  //=include ./components/controls/picker-controls.js
  //=include ./components/partial.js

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
      incrementDate: function(commit, scale) {
        return self.incrementDate(commit, scale);
      },
      decrementDate: function(commit, scale) {
        return self.decrementDate(commit, scale);
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

  DatePicker.prototype.incrementDate = function(commit, scale) {
    commit = commit === undefined ? false : !!commit;
    this.controls.incrementDate(commit, scale);
  };

  DatePicker.prototype.decrementDate = function(commit, scale) {
    commit = commit === undefined ? false : !!commit;
    this.controls.decrementDate(commit, scale);
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