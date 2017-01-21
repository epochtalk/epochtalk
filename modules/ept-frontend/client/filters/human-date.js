'use strict';
/* jslint node: true */

module.exports = ['$filter', function ($filter) {
  return function(dateStr, hideTime) {
    var result;
    var now = new Date();
    var maxDate = new Date(8640000000000000);
    var date = new Date(dateStr);
    var isToday = now.toDateString() === date.toDateString();
    var isThisYear = now.getYear() === date.getYear();
    var isMaxDate = maxDate.getTime() === date.getTime();
    if (hideTime) {
      if (isToday) { result = 'Today'; }
      else if (isMaxDate) { result = 'Permanent'; } // bans
      else { result = $filter('date')(dateStr, 'MMMM d, y'); }
    }
    else {
      if (isToday) { result = 'Today at ' +  $filter('date')(dateStr, 'h:mm a'); }
      else if (isThisYear) { result = $filter('date')(dateStr, "MMMM d 'at' h:mm a"); }
      else { result = $filter('date')(dateStr, "MMMM d, y 'at' h:mm a"); }
    }
    return result;
  };
}];
