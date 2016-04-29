(function(){
  var defaults = {
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

  function DatePicker(options){
    options = options === undefined ? {} : options;
    this.scale = (options.scale !== undefined && DatePicker.prototype.scales.indexOf(options.scale) !== -1)? options.scale : defaults.scale;
    if(options.date instanceof Date){
      this.date = options.date;
      this.year = options.date.getUTCFullYear();
      this.month = options.date.getUTCMonth();
      this.day = options.date.getUTCDate();
    }else{
      this.date = defaults.date;
      this.year = defaults.date.getUTCFullYear();
      this.month = defaults.date.getUTCMonth();
      this.day = defaults.date.getUTCDate();
    }
    this.partials = {
      "day": new Calendar(this.date, "day"),
      "week": new Calendar(this.date, "week"),
      "month": new Calendar(this.date, "month"),
      "year": new Calendar(this.date, "year")
    };
    //Generating markup
    this.svg = generateSVG(options);
    this.html = generateControls(this.partials);

    //Appending to DOM
    //Appending SVG to body
    document.querySelector('body').appendChild(this.svg);

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

  DatePicker.prototype.scales = ["day","week","month","year"];

  }

  DatePicker.prototype.Calendar = Calendar;

  //=include ./calendar.js

  /**
  * Initializes the SVG icons for the DatePicker
  * @param options <Object> List of options for the DatePicker
  **/
  function generateSVG(options){
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
      var elements, element;
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
        for(var i = 0 ; i < ids.length; i++){
          id = ids[i];
          element = document.createElement('svg');
          element.innerHTML = defaults.icons[id];
          element = element.firstChild.firstChild;
          svg.appendChild(element);
        }
      }else{
        for(var i = 0 ; i < elements.length ; i++){
          svg.appendChild(elements[i]);
        }
      }
    };
    initIcons(idbig, options.icons);
    initIcons(idsmall, options.icons);
    return svg;
  }

  function generateControls(){
  }

  window.DatePicker = DatePicker;
  return window.DatePicker;
})();

/*
options = {
  scale: string, //day, week, ...
  date: Date,
  icons: {
    "arrow-prev-big": HTMLElement or Node
    "arrow-prev-small": HTMLElement or Node
    "arrow-next-big": HTMLElement or Node
    "arrow-prev-small": HTMLElement or Node
  },
  changeScaleBehaviour


}
*/
