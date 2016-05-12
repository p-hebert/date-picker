(function(){

  //=include ./events/events.js
  //=include ./events/colleague.js
  //=include ./events/mediator.js
  //=include ./utilities/date-utils.js
  //=include ./utilities/number-utils.js
  //=include ./utilities/uuid-utils.js
  //=include ./components/calendar/calendar.js
  //=include ./components/sliders/increment-slider.js
  //=include ./components/sliders/year-increment-slider.js
  //=include ./components/sliders/month-increment-slider.js
  //=include ./components/partial.js


  function DatePicker(options){
    //super()
    Colleague.call(this, new Mediator());
    if(options === undefined){
      options = this.deepCopyObject(DatePicker.prototype.defaults);
    }else{
      options = Object.assign(this.deepCopyObject(DatePicker.prototype.defaults), this.deepCopyObject(options));
    }
    options.mediator = this.mediator;
    console.log(options);


    this.scale = (options.scale !== undefined && DatePicker.prototype.enum.scales[options.scale] !== undefined)? options.scale : DatePicker.prototype.defaults.scale;
    this.date = options.date instanceof Date ? options.date : new Date();
    this.context = options.parent;

    //Setting up the partials
    this.partials = {};
    options.scale = this.scale;
    options.value = options.date;
    this.partials.day = new Partial(options);
    /*options.scale = DatePicker.prototype.enum.scale.week;
    this.partials.week = new Partial(options);
    options.scale = DatePicker.prototype.enum.scale.month;
    this.partials.month = new Partial(options);
    options.scale = DatePicker.prototype.enum.scale.year;
    this.partials.year = new Partial(options);*/

    //Generating markup and appending to DOM
    this.generateSVG(options.icons);
    this.generateHTML();
  }

  //Binding the prototype of the Parent object
  //Properties will be overriden on this one.
  DatePicker.prototype = Object.create(Colleague.prototype);

  //Binding the constructor to the prototype
  DatePicker.prototype.constructor = Colleague;

  //Creating a parent property (like super in Java)
  //Allows to call overriden properties
  DatePicker.prototype.parent = Colleague.prototype;

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
    events: Events
  };

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


  DatePicker.prototype.generateHTML = function () {
    var container = document.createElement('div');
    container.className = "date-picker-body";
    console.log(this.partials);
    console.log(this.scale);
    container.appendChild(this.partials[this.scale].getHTML());
    this.html = container;

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
