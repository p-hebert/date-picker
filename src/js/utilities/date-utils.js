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
    return new Date(date.getUTCFullYear(), date.getUTCMonth(),date.getUTCDate() - 7);
  },
  getDateInNextWeek: function(date){
    return new Date(date.getUTCFullYear(), date.getUTCMonth(),date.getUTCDate() + 7);
  },
  //Get the week's first and last days.
  getWeekFALDays: function(date){
    var week = {};
    var day, month, year, daysInMonth;
    day = date.getUTCDate() - date.getUTCDay();
    month = day < 1 ? date.getUTCMonth() -1 : date.getUTCMonth();
    year = month < 0 ? date.getUTCFullYear() -1 : date.getUTCFullYear();
    month = month === -1 ? 11 : month;
    day = day < 1 ? this.daysInMonth(year, month) + day : day;
    week.start = new Date(year, month, day);

    day = week.start.getUTCDate() + 6;
    daysInMonth = this.daysInMonth(date.getUTCFullYear(), date.getUTCMonth());
    month = day > daysInMonth ? month + 1 : month;
    year = month === 12 ? date.getUTCFullYear() + 1 : date.getUTCFullYear();
    month = month === 12 ? 0 : month;
    day = day > daysInMonth ? day - daysInMonth - 1 : day;
    week.end = new Date(year, month, day);

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
