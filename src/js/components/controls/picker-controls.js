var PickerControls = (function(){
  function PickerControls(options, component){
    //super()
    component = component === undefined? PickerControls.prototype.component : component;
    IncrementSlider.call(this, options, component);
    this.generateEvents();

    //Upper/Lower bounds to date value
    this.min_date = options.min_date instanceof Date ?
                    new Date(options.min_date.getUTCFullYear(), options.min_date.getUTCMonth(), options.min_date.getUTCDate()) :
                    undefined;
    this.max_date = options.max_date instanceof Date && options.max_date > this.min_date?
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
    day : "day",
    week : "week",
    month : "month",
    year : "year"
  };

  PickerControls.prototype.enum.languages = {
    en: 'en',
    fr: 'fr'
  };

  /**
  * @override
  **/
  PickerControls.prototype.setValue = function(value){
    if(value !== undefined){
      this.date = new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
    }
    switch(this.scale){
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
    this.callCallback(IncrementSlider.prototype.enum.valuechange);
  };

  /**
  * @override
  **/
  PickerControls.prototype.setUIValue = function(){
    var uivalue = "";
    switch(this.scale){
      case PickerControls.prototype.enum.scales.day:
        switch(this.lang){
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
        switch(this.lang){
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
        switch(this.lang){
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
  PickerControls.prototype.generateHTML = function(){
    var self = this;
    var inner =
      '<svg class="date-picker-global-increment prev"><use xlink:href="#arrow-prev-big"></svg>'+
      '<div class="date-picker-date-label"></div>' +
      '<svg class="date-picker-global-increment next"><use xlink:href="#arrow-next-big"></svg>';
    this.input = document.createElement('div');
    this.input.className = "date-picker-input";
    this.input.innerHTML = inner;
    this.setValue();
    this.prev = this.input.children[0];
    this.input.children[1].addEventListener('click', function(){
      if(self.input.className.indexOf('open') !== -1){
        self.input.className = "date-picker-input";
      }else{
        self.input.className = "date-picker-input open";
      }
    });
    this.prev.addEventListener('click', function(){
      self.onPrevClick();
    });
    this.next = this.input.children[2];
    this.next.addEventListener('click', function(){
      self.onNextClick();
    });
    this.updateUIControls();
  };

  PickerControls.prototype.updateUIControls = function(){
    //Hiding previous button if at the min value
    if(this.testMin()){
      this.prev.setAttribute("class", "date-picker-global-increment prev disabled");
      this.prev.isDisabled = true;
      //Hiding next button if at the max value
    }else if(this.testMax()){
      this.next.setAttribute("class", "date-picker-global-increment next disabled");
      this.next.isDisabled = true;
    //Else making sure button is visible
    }else{
      if(this.min_value !== undefined){
        this.prev.setAttribute("class", "date-picker-global-increment prev");
        this.prev.isDisabled = false;
      }
      if(this.max_value !== undefined){
        this.next.setAttribute("class", "date-picker-global-increment next");
        this.next.isDisabled = false;
      }
    }
  };



  /**
  * @override
  **/
  PickerControls.prototype.testMin = function () {
    switch(this.scale){
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
  PickerControls.prototype.testMax = function () {
    switch(this.scale){
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
  PickerControls.prototype.onPrevClick = function () {
    if(this.prev.isDisabled === true){
      return;
    }
    switch(this.scale){
      case PickerControls.prototype.enum.scales.day:
        this.emit(this.mediation.events.emit.decday, {});
        break;
      case PickerControls.prototype.enum.scales.week:
        this.emit(this.mediation.events.emit.decweek, {});
        break;
      case PickerControls.prototype.enum.scales.month:
        this.emit(this.mediation.events.emit.decmonth, {});
        break;
      case PickerControls.prototype.enum.scales.year:
        this.emit(this.mediation.events.emit.decyear, {});
        break;
    }
  };

  /**
  * @override
  **/
  PickerControls.prototype.onNextClick = function () {
    if(this.next.isDisabled === true){
      return;
    }
    switch(this.scale){
      case PickerControls.prototype.enum.scales.day:
        this.emit(this.mediation.events.emit.incday, {});
        break;
      case PickerControls.prototype.enum.scales.week:
        this.emit(this.mediation.events.emit.incweek, {});
        break;
      case PickerControls.prototype.enum.scales.month:
        this.emit(this.mediation.events.emit.incmonth, {});
        break;
      case PickerControls.prototype.enum.scales.year:
        this.emit(this.mediation.events.emit.incyear, {});
        break;
    }
  };

  PickerControls.prototype.generateEvents = function () {
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

  PickerControls.prototype.subscribe = function (parent) {
    if(parent !== undefined){
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
  PickerControls.prototype.notify = function (e) {
    if(e.scope === Events.scope.broadcast){
      switch(e.desc){
        case Events.desc.update.controls:
        case Events.desc.update.global:
          if(e.data.min_date !== undefined && e.data.date instanceof Date){
            this.min_date = new Date(e.data.min_date.getUTCFullYear(), e.data.min_date.getUTCMonth(), e.data.min_date.getUTCDate());
          }
          if(e.data.max_date !== undefined && e.data.date instanceof Date){
            this.max_date = new Date(e.data.max_date.getUTCFullYear(), e.data.max_date.getUTCMonth(), e.data.max_date.getUTCDate());
          }
          if(e.data.scale !== undefined && PickerControls.prototype.enum.scales[e.data.scale] !== undefined){
            this.scale = PickerControls.prototype.enum.scales[e.data.scale];
            this.setValue();
          }
          if(e.data.date !== undefined && e.data.date instanceof Date){
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
