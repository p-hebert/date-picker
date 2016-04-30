(function(){

  function DatePicker(options){
    if(options === undefined){
      options = this.deepCopyObject(DatePicker.prototype.defaults);
    }else{
      options = Object.assign(this.deepCopyObject(DatePicker.prototype.defaults), this.deepCopyObject(options));
    }
    console.log(options);
    this.scale = (options.scale !== undefined && DatePicker.prototype.scales.indexOf(options.scale) !== -1)? options.scale : DatePicker.prototype.defaults.scale;
    if(options.date instanceof Date){
      this.date = options.date;
      this.year = options.date.getUTCFullYear();
      this.month = options.date.getUTCMonth();
      this.day = options.date.getUTCDate();
    }
    this.partials = {
      "day": new Calendar(options, "day"),
      //"week": new Calendar(options, "week"),
      //"month": new Calendar(options, "month"),
      //"year": new Calendar(options, "year")
    };
    //Generating markup and appending to DOM
    this.svg = generateSVG(options);

    var container = document.createElement('div');
    container.className = "date-picker-body";
    container.appendChild(this.partials.day.getHTML());
    this.html = container;

    //Appending HTML to options.parent
    var parent;
    if(typeof options.parent === "string"){
      parent = document.querySelector(options.parent);
      parent.appendChild(this.html);
    }else if(options.parent.nodeType !== undefined){
      parent = options.parent;
      parent.appendChild(this.html);
    }

  }

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
  };

  DatePicker.prototype.scales = ["day","week","month","year"];

  DatePicker.prototype.Calendar = Calendar;

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

  //=include ./calendar.js

  /**
  * Initializes the SVG icons for the DatePicker
  * @param options <Object> List of options for the DatePicker
  **/
  var generateSVG = function(options){
    //If icons are already set, return
    if(document.querySelector("svg#dp-icons")){
      return document.querySelector("svg#dp-icons");
    }
    var svg = document.createElement('svg');
    svg.id = "dp-icons";
    svg.style.display = "none";
    var idsmall = ['arrow-prev-small', 'arrow-next-small'],
        idbig = ['arrow-prev-big', 'arrow-next-big'];

    var initIcons = function(ids, icons){
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
          svg.appendChild(element);
        }
      }else{
        for(var k = 0 ; k < elements.length ; k++){
          svg.appendChild(elements[k]);
        }
      }
    };
    initIcons(idbig, options.icons);
    initIcons(idsmall, options.icons);
    document.querySelector('body').appendChild(svg);
    return svg;
  };

  window.DatePicker = DatePicker;
  return window.DatePicker;
})();
