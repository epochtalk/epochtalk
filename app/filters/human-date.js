'use strict';
/* jslint node: true */

module.exports = ['$filter', function ($filter) {
  return function(dateStr) {
    var result;
    var now = new Date();
    var date = new Date(dateStr);
    var isToday = now.toDateString() === date.toDateString();
    var isThisYear = now.getYear() === date.getYear();
    if (isToday) {
      result = 'Today at ' +  $filter('date')(dateStr, 'h:mm:ss a');
    }
    else if (isThisYear) {
      result = $filter('date')(dateStr, 'MMMM d, h:mm:ss a');
    }
    else {
      result = $filter('date')(dateStr, 'MMM d, y, h:mm:ss a');
    }
    return result;
  };
}];