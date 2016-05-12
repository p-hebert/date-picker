var DateUtils = {

  //Normally one shouldn't include translations directly into code.
  //However in this case there is so little translations that it doesn't matter.
  months: {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    fr: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
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
  }
};
