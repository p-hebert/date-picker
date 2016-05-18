(function(){

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

  function DatePicker(options){
    //super()
    Colleague.call(this, new Mediator(), DatePicker.prototype.component);
    this.generateEvents();

    if(options === undefined){
      options = this.deepCopyObject(DatePicker.prototype.defaults);
    }else{
      options = Object.assign(this.deepCopyObject(DatePicker.prototype.defaults), this.deepCopyObject(options));
    }
    options.mediator = this.mediator;
    this.context = options.parent;

    this.scale = (options.scale !== undefined && DatePicker.prototype.enum.scales[options.scale] !== undefined)?
                  options.scale : DatePicker.prototype.defaults.scale;

    this.min_date = options.min_date instanceof Date ?
                    options.min_date :
                    undefined;
    this.max_date = options.max_date instanceof Date && options.max_date > this.min_date?
                    options.max_date :
                    undefined;
    this.date = options.date instanceof Date && options.date >= this.min_date && options.date <= this.max_date ?
                options.date : undefined;
    if(this.date === undefined){
      if(this.min_date){
        this.date = new Date(this.min_date.getUTCFullYear(), this.min_date.getUTCMonth(), this.min_date.getUTCDate());
        options.date = new Date(this.min_date.getUTCFullYear(), this.min_date.getUTCMonth(), this.min_date.getUTCDate());
      }else if(this.max_date){
        this.date = new Date(this.max_date.getUTCFullYear(), this.max_date.getUTCMonth(), this.max_date.getUTCDate());
        options.date = new Date(this.max_date.getUTCFullYear(), this.max_date.getUTCMonth(), this.max_date.getUTCDate());
      }else{
        this.date = new Date();
        options.date = new Date(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate());
      }
    }
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
      day : "day",
      week : "week",
      month : "month",
      year : "year"
    },
    languages: {
      en: 'en',
      fr: 'fr'
    }
  };

  DatePicker.prototype.setDate = function (date) {
    if(date !== undefined && date instanceof Date && date >= this.min_date && date <= this.max_date){
      this.date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      this.emit(this.mediation.events.gupdate, {date: date});
      return true;
    }
    return false;
  };

  DatePicker.prototype.setMinDate = function (date) {
    if(date !== undefined && date instanceof Date && date < this.max_date){
      this.min_date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      this.emit(this.mediation.events.gupdate, {min_date: date});
      return true;
    }
    return false;
  };

  DatePicker.prototype.setMaxDate = function (date) {
    if(date !== undefined && date instanceof Date && date > this.min_date){
      this.max_date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      this.emit(this.mediation.events.gupdate, {max_date: date});
      return true;
    }
    return false;
  };

  DatePicker.prototype.changeScale = function(scale){
    this.scale = DatePicker.prototype.enum.scales[scale] === undefined ?
                 DatePicker.prototype.enum.scales.day : DatePicker.prototype.enum.scales[scale];
    this.body.removeChild(this.body.children[0]);
    this.body.appendChild(this.partials[this.scale].getHTML());
  };

  DatePicker.prototype.generateHTML = function () {
    var self = this,
        callback = function(e){
          self.onModeBtnClick(e.target);
        };
    var datepicker = document.createElement('div');
    datepicker.className = "date-picker";

    var content = document.createElement('div');
    content.className = "date-picker-content";

    var moderow = document.createElement('div');
    moderow.className = "date-picker-mode-button-row";

    var button;
    for(var key in DatePicker.prototype.enum.scales){
      button = document.createElement('span');
      button.scale = key;
      button.innerHTML = key.charAt(0).toUpperCase() + key.slice(1);
      button.addEventListener('click', callback);
      if(this.scale === key){
        moderow.current = button;
        button.className = "date-picker-mode-button active";
      }else{
        button.className = "date-picker-mode-button";
      }
      moderow.appendChild(button);
    }

    var body = document.createElement('div');
    body.className = "date-picker-body";
    body.appendChild(this.partials[this.scale].getHTML());

    content.appendChild(moderow);
    content.appendChild(body);

    datepicker.appendChild(this.controls.getHTML());
    datepicker.appendChild(content);

    this.html = datepicker;
    this.body = body;

    //Appending HTML to options.parent
    var parent;
    if(typeof this.context === "string"){
      parent = document.querySelector(this.context);
      parent.appendChild(this.html);
    }else if(this.context.nodeType !== undefined){
      parent = this.context;
      parent.appendChild(this.html);
    }
  };

  DatePicker.prototype.onModeBtnClick = function (span) {
    var buttons = this.html.children[1].children[0];
    buttons.current.className = "date-picker-mode-button";
    buttons.current = span;
    this.changeScale(span.scale);
    this.emit(this.mediation.events.broadcast.pcupdate, {scale: span.scale});
    buttons.current.className = "date-picker-mode-button active";
  };

  /**
  * Initializes the SVG icons for the DatePicker
  * @param options <Object> List of options for the DatePicker
  **/
  DatePicker.prototype.generateSVG = function(icons){
    //If icons are already set, return
    if(document.querySelector("svg#dp-icons")){
      return document.querySelector("svg#dp-icons");
    }
    var svg = document.createElement('svg'),
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

  DatePicker.prototype._initIcons = function (ids, icons) {
    var valid = false;
    var id;
    var elements = [], element;
    if(icons !== undefined){
      valid = true;
      for(var i = 0 ; i < ids.length ; i++){
        id = ids[i];
        //Verifies if the icons passed are HTMLElements
        try {
          if(typeof icons[id] === "string"){
            element = document.createElement('div');
            element.innerHTML = icons[id];
            element = element.firstChild;
            element.id = id;
            elements.push(element);
          }else if(icons[id].nodeType !== undefined){
            elements.push(icons[id]);
          }else{
            throw new Error("Illegal argument: Icons passed in option.icons are not HTML string nor HTMLElements. Falling back to base icons for the group of icons " + ids.toString() + ".");
          }
        }catch(e){
          valid = false;
          console.error(e);
        }
      }
    }

    if(!valid){
      for(var j = 0 ; j < ids.length; j++){
        id = ids[j];
        element = document.createElement('svg');
        element.innerHTML = DatePicker.prototype.defaults.icons[id];
        element = element.firstChild.firstChild;
        this.svg.appendChild(element);
      }
    }else{
      for(var k = 0 ; k < elements.length ; k++){
        this.svg.appendChild(elements[k]);
      }
    }
  };

  DatePicker.prototype.generateEvents = function () {
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

  DatePicker.prototype.subscribe = function () {
    //Updates
    this.mediator.subscribe(this.mediation.events.broadcast.gupdate, this.partials.day);
    this.mediator.subscribe(this.mediation.events.broadcast.gupdate, this.partials.week);
    this.mediator.subscribe(this.mediation.events.broadcast.gupdate, this.partials.month);
    this.mediator.subscribe(this.mediation.events.broadcast.gupdate, this.partials.year);
    this.mediator.subscribe(this.mediation.events.broadcast.dupdate, this.partials.day);
    this.mediator.subscribe(this.mediation.events.broadcast.wupdate, this.partials.week);
    this.mediator.subscribe(this.mediation.events.broadcast.mupdate, this.partials.month);
    this.mediator.subscribe(this.mediation.events.broadcast.yupdate, this.partials.year);
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
  DatePicker.prototype.notify = function (e) {
    if(e.scope === Events.scope.emit){
      switch(e.desc){
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
        default:
          break;
      }
      if(e.data.date instanceof Date){
        this.date = new Date(e.data.date.getUTCFullYear(), e.data.date.getUTCMonth(), e.data.date.getUTCDate());
      }
    }
  };

  DatePicker.prototype.deepCopyObject = function(options){
      return deepCopyObject(options, {});
  };

  var deepCopyObject = function(object, copy){
    for(var key in object){
      if(typeof object[key] === "string" || typeof object[key] === "number" || typeof object[key] === "function"){
        copy[key] = object[key];
      }else if(typeof object[key] === "object" && object[key] !== null){
        if(object[key] instanceof Date){
          copy[key] = new Date(object[key].getUTCFullYear(), object[key].getUTCMonth(), object[key].getUTCDate());
        }else if (object[key].nodeType !== undefined){
          copy[key] = object[key];
        }else{
          copy[key] = deepCopyObject(object[key], {});
        }
      }
    }
    return copy;
  };

  window.DatePicker = DatePicker;
  return window.DatePicker;
})();
