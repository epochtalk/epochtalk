'use strict';
/* jslint node: true */

module.exports = [function () {
  return function(text, length) {
    if (isNaN(length)) {
      length = 10;
    }
    var end = '&hellip;';
    if (text.length <= length || text.length - 3 <= length) {
      return text;
    }
    else {
      return String(text).substring(0, length-end.length) + end;
    }
  };
}];