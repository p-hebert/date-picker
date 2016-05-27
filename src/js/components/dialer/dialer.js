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
