'use strict';
/* jslint node: true */

module.exports = [function () {
  return function(text, length) {
    if (!text) { return; }
    if (isNaN(length)) { length = 10; }

    var end = '...';
    var endLen = 3;
    if (text.length <= length) { return text; }
    else {
      return String(text).substring(0, length - endLen).trim() + end;
    }
  };
}];
