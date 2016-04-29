var Calendar =
(function(){

  function Calendar(options){
    //Upper/Lower bounds to date value
    this.max = options.max_date;
    this.min = options.min_date;
    this.lang = (options.lang !== undefined && ['en','fr'].indexOf(options.lang) !== -1) ? options.lang : 'en';
    //Actual date returned when user commits change by leaving window
    this.date = options.date;
    this.year = options.date.getUTCFullYear();
    this.month = options.date.getUTCMonth();
    this.day = options.date.getUTCDate();

    //Temp date used until user commits change by leaving window
    this.prev_date = new Date();
    this.prev_date.setUTCFullYear(this.year);
    this.prev_date.setUTCMonth(this.month);
    this.prev_date.setUTCDate(this.day);

    //Scale for this implementation
    this.scale = options.scale;

    //UI Components to watch
    this.uicomponents = {};

    this.generateHTML(options.callback);

  }

  //Normally one shouldn't include translations directly into code.
  //However in this case there is so little translations that it doesn't matter.
  Calendar.prototype.months = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    fr: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
  };

  Calendar.prototype.generateHTML = function(callback){
    switch(this.scale){
      case "day":
        this.html = this.dailyCalendarHTML(callback);
        break;
      case "week":
        this.html = this.weeklyCalendarHTML(callback);
        break;
      case "month":
        this.html = this.monthlyCalendarHTML(callback);
        break;
      case "year":
        this.html = this.yearlyCalendarHTML(callback);
        break;
      default:
        break;
    }
  };

  Calendar.prototype.uiapply = function(scale) {
    if(scale === undefined){
      for(var s in this.uicomponents){
        for(var fn in this.uicomponents[s]){
          this.fn();
        }
      }
    }else{
      for(var fn2 in this.uicomponents[scale]){
        this.fn2();
      }
    }

  };

  Calendar.prototype.uiregister = function(scale, fn) {
    if(this.uicomponents[scale] === undefined){
      this.uicomponents[scale] = [];
    }
    this.uicomponents[scale].push(fn);
  };


  Calendar.prototype.dailyCalendarHTML = function () {
    var container = document.createElement('div'),
        wrapper = document.createElement('div'),
        inc_input = [this.yearInputHTML(), this.monthInputHTML()],
        rows = [];
        container.className = "date-picker-mode-day active";
        wrapper.className = "date-picker-content-wrapper";
  };

  Calendar.prototype.yearInputHTML = function () {
    var self = this;
    var inner =
      '<span class="increment-input-value"></span>' +
      '<nav>' +
        '<svg class="increment-input-button prev"><use xlink:href="#arrow-prev-small"></svg>' +
        '<svg class="increment-input-button next"><use xlink:href="#arrow-next-small"></svg>' +
      '</nav>';

    var yinput = document.createElement('div');
    yinput.className = "increment-input";
    yinput.innerHTML = inner;
    yinput.children[0].innerHTML = this.year;
    this.uiregister("year", function(){
      yinput.children[0].innerHTML = self.year;
    });

    var yprev = yinput.children[1].children[0];
    this.uiregister("year", function(){
      //Hiding previous button if at the min value
      if(self.min_date !== undefined && self.min_date.getUTCFullYear() === self.year){
        yprev.className = "increment-input-button prev disabled";
        yprev.isDisabled = true;
      //Else making sure button is visible
      }else{
        yprev.className = "increment-input-button prev";
        yprev.isDisabled = false;
      }
    });
    yprev.addEventListener('click', function(){
      yprevClickCallback(self, yprev);
    });

    var ynext = yinput.children[1].children[1];
    this.uiregister("year", function(){
      //Hiding next button if at the max value
      if(self.max_date !== undefined && self.max_date.getUTCFullYear() === self.year){
        ynext.className = "increment-input-button next disabled";
        ynext.isDisabled = true;
      //Else making sure button is visible
      }else{
        ynext.className = "increment-input-button next";
        ynext.isDisabled = false;
      }
    });
    ynext.addEventListener('click', function(){
      ynextClickCallback(self, ynext);
    });

    return yinput;
  };

  Calendar.prototype.monthInputHTML = function () {
    var self = this;
    var inner =
      '<span class="increment-input-value"></span>' +
      '<nav>' +
        '<svg class="increment-input-button prev"><use xlink:href="#arrow-prev-small"></svg>' +
        '<svg class="increment-input-button next"><use xlink:href="#arrow-next-small"></svg>' +
      '</nav>';

    var minput = document.createElement('div');
    minput.className = "increment-input";
    minput.innerHTML = inner;
    minput.children[0].innerHTML = this.months[this.lang][this.month];
    this.uiregister("month", function(){
      minput.children[0].innerHTML = self.months[self.lang][self.month];
    });

    var mprev = minput.children[1].children[0];
    this.uiregister("month", function(){
      //Hiding previous button if at the min value
      if(self.min_date !== undefined &&
        self.min_date.getUTCFullYear() === self.year && self.min_date.getUTCMonth() === self.month){
        mprev.className = "increment-input-button prev disabled";
        mprev.isDisabled = true;
      //Else making sure button is visible
      }else{
        mprev.className = "increment-input-button prev";
        mprev.isDisabled = false;
      }
    });

    mprev.addEventListener('click', function(){
      mprevClickCallback(self, mprev);
    });

    var mnext = minput.children[1].children[1];
    this.uiregister("month", function(){
      //Hiding next button if at the max value
      if(self.max_date !== undefined &&
        self.max_date.getUTCFullYear() === self.year && self.max_date.getUTCMonth() === self.month){
        mnext.className = "increment-input-button next disabled";
        mnext.isDisabled = true;
      //Else making sure button is visible
      }else{
        mnext.className = "increment-input-button next";
        mnext.isDisabled = false;
      }
    });

    mnext.addEventListener('click', function(){
      mnextClickCallback(self, mnext);
    });

    return minput;
  };

  var yprevClickCallback = function(self, button){
    if(button.isDisabled === true){
      return;
    }
    var year = self.date.getUTCFullYear() - 1,
        apply = false;
    //Checks if action is legal (not going below min year)
    if(self.min_date === undefined || self.min_date.getUTCFullYear() <= year){
      apply = true;
      self.date.setUTCFullYear(year);
      self.year = year;

      //Making sure that we are not going below the min date on the smaller scales than year
      if(self.min_date !== undefined && self.min_date.getUTCFullYear() === year){
        if(self.min_date.getUTCMonth() > self.month){
          self.date.setUTCMonth(self.min_date.getUTCMonth());
          self.date.setUTCDate(self.min_date.getUTCDate());
          self.month = self.min_date.getUTCMonth();
          self.day = self.min_date.getUTCDate();
        }else if(self.min_date !== undefined && self.min_date.getUTCDay() > self.day && self.min_date.getUTCMonth() === self.month){
          self.date.setUTCDate(self.min_date.getUTCDate());
          self.day = self.min_date.getUTCDate();
        }
      }
      if(apply){
        self.uiapply();
      }
    }
    //else do nothing
  };

  var ynextClickCallback = function(self, button){
    if(button.isDisabled === true){
      return;
    }
    var year = self.date.getUTCFullYear() + 1,
        apply = false;
    //Checks if action is legal (not going below min year)
    if(self.max_date === undefined || self.max_date.getUTCFullYear() >= year){
      apply = true;
      self.date.setUTCFullYear(year);
      self.year = year;

      //Making sure that we are not going above the max date on the smaller scales than year
      if(self.max_date !== undefined && self.max_date.getUTCFullYear() === year){
        if(self.max_date.getUTCMonth() < self.month){
          self.date.setUTCMonth(self.max_date.getUTCMonth());
          self.date.setUTCDate(self.max_date.getUTCDate());
          self.month = self.max_date.getUTCMonth();
          self.day = self.max_date.getUTCDate();
        }else if(self.max_date !== undefined && self.max_date.getUTCDay() > self.day && self.max_date.getUTCMonth() === self.month){
          self.date.setUTCDate(self.max_date.getUTCDate());
          self.day = self.max_date.getUTCDate();
        }
      }
      if(apply){
        self.uiapply();
      }
    }
    //else do nothing
  };

  var mprevClickCallback = function(self, button){
    if(button.isDisabled === true){
      return;
    }
    var year = self.date.getUTCFullYear(),
        month = (self.date.getUTCMonth() - 1) % 12,
        apply = false;
    //If no min_date, no constraints.
    if(self.min_date === undefined || self.min_date.getUTCFullYear() < year-1){
      apply = true;
      self.date.setUTCMonth(month);
      self.month = month;
      if(month === 11){
        self.date.setUTCFullYear(year - 1);
        self.year = year - 1;
      }
    //If min year is = to year, must check for month and day.
    }else if(self.min_date.getUTCFullYear() === year && month !== 11){

      //Check if action is valid
      if(self.min_date.getUTCMonth() < month || self.min_date.getUTCMonth() === month){
        apply = true;
        self.date.setUTCMonth(month);
        self.month = month;
      }
      //Granted min month = month
      //Resets the day if conflict between min day and currently selected day
      if(self.min_date.getUTCMonth() === month && self.min_date.getUTCDay() > self.day){
        self.date.setUTCDate(self.min_date.getUTCDate());
        self.day = self.min_date.getUTCDate();
      }

    }else if(self.min_date.getUTCFullYear() === year - 1 && month === 11){

        if(self.min_date.getUTCMonth() < month || self.min_date.getUTCMonth() === month){
          apply = true;
          self.date.setUTCFullYear(year - 1);
          self.year = year - 1;
          self.date.setUTCMonth(month);
          self.month = month;
        }

        if(self.min_date.getUTCMonth() === month && self.min_date.getUTCDay() > self.day){
          self.date.setUTCDate(self.min_date.getUTCDate());
          self.day = self.min_date.getUTCDate();
        }

    }else if(self.min_date.getUTCFullYear() === year - 1 && month !== 11){
      apply = true;
      self.date.setUTCMonth(month);
      self.month = month;
    }

    if(apply){
      self.uiapply();
    }
  };

  var mnextClickCallback = function(self, button){
    if(button.isDisabled === true){
      return;
    }
    var year = self.date.getUTCFullYear(),
        month = (self.date.getUTCMonth() + 1) % 12,
        apply = false;
    //If no max_date, no constraints.
    if(self.max_date === undefined || self.max_date.getUTCFullYear() < year-1){
      apply = true;
      self.date.setUTCMonth(month);
      self.month = month;
      if(month === 0){
        self.date.setUTCFullYear(year + 1);
        self.year = year + 1;
      }
    //If max year is = to year, must check for month and day.
  }else if(self.max_date.getUTCFullYear() === year && month !== 0){

      //Check if action is valid
      if(self.max_date.getUTCMonth() > month || self.max_date.getUTCMonth() === month){
        apply = true;
        self.date.setUTCMonth(month);
        self.month = month;
      }
      //Granted max month = month
      //Resets the day if conflict between max day and currently selected day
      if(self.max_date.getUTCMonth() === month && self.max_date.getUTCDay() < self.day){
        self.date.setUTCDate(self.max_date.getUTCDate());
        self.day = self.max_date.getUTCDate();
      }

    }else if(self.max_date.getUTCFullYear() === year + 1 && month === 0){

        if(self.max_date.getUTCMonth() > month || self.max_date.getUTCMonth() === month){
          apply = true;
          self.date.setUTCFullYear(year + 1);
          self.year = year + 1;
          self.date.setUTCMonth(month);
          self.month = month;
        }

        if(self.max_date.getUTCMonth() === month && self.max_date.getUTCDay() < self.day){
          self.date.setUTCDate(self.max_date.getUTCDate());
          self.day = self.max_date.getUTCDate();
        }

    }else if(self.max_date.getUTCFullYear() === year + 1 && month !== 0){
      apply = true;
      self.date.setUTCMonth(month);
      self.month = month;
    }

    if(apply){
      self.uiapply();
    }
  };

  <div class="date-picker-mode-day active">
    <div class="date-picker-content-wrapper">
      <div class="increment-input">
        <span class="increment-input-value">2016</span>
        <nav>
          <svg class="increment-input-button prev"><use xlink:href="#arrow-prev-small"></svg>
          <svg class="increment-input-button next"><use xlink:href="#arrow-next-small"></svg>
        </nav>
      </div>
      <div class="increment-input">
        <span class="increment-input-value">March</span>
        <nav>
          <svg class="increment-input-button prev"><use xlink:href="#arrow-prev-small"></svg>
          <svg class="increment-input-button next"><use xlink:href="#arrow-next-small"></svg>
        </nav>
      </div>
      <div class="date-picker-week-row">
        <span class="date-picker-day-cell disabled">28</span>
        <span class="date-picker-day-cell disabled">29</span>
        <span class="date-picker-day-cell">1</span>
        <span class="date-picker-day-cell">2</span>
        <span class="date-picker-day-cell">3</span>
        <span class="date-picker-day-cell">4</span>
        <span class="date-picker-day-cell">5</span>
      </div>
      <div class="date-picker-week-row">
        <span class="date-picker-day-cell active">6</span>
        <span class="date-picker-day-cell">7</span>
        <span class="date-picker-day-cell">8</span>
        <span class="date-picker-day-cell">9</span>
        <span class="date-picker-day-cell">10</span>
        <span class="date-picker-day-cell">11</span>
        <span class="date-picker-day-cell">12</span>
      </div>
      <div class="date-picker-week-row">
        <span class="date-picker-day-cell">13</span>
        <span class="date-picker-day-cell">14</span>
        <span class="date-picker-day-cell">15</span>
        <span class="date-picker-day-cell">16</span>
        <span class="date-picker-day-cell">17</span>
        <span class="date-picker-day-cell">18</span>
        <span class="date-picker-day-cell">19</span>
      </div>
      <div class="date-picker-week-row">
        <span class="date-picker-day-cell">20</span>
        <span class="date-picker-day-cell">21</span>
        <span class="date-picker-day-cell">22</span>
        <span class="date-picker-day-cell">23</span>
        <span class="date-picker-day-cell">24</span>
        <span class="date-picker-day-cell">25</span>
        <span class="date-picker-day-cell">26</span>
      </div>
      <div class="date-picker-week-row">
        <span class="date-picker-day-cell">27</span>
        <span class="date-picker-day-cell">28</span>
        <span class="date-picker-day-cell">29</span>
        <span class="date-picker-day-cell">30</span>
        <span class="date-picker-day-cell disabled">1</span>
        <span class="date-picker-day-cell disabled">2</span>
        <span class="date-picker-day-cell disabled">3</span>
      </div>
    </div>
  </div>

  Calendar.prototype.getHTML = function(){
    return this.html;
  };

  return Calendar;
})();
