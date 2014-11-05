'use strict';
/* jslint node: true */

module.exports = [function () {
  return function(text, length) {
    if (isNaN(length)) {
      length = 10;
    }
    var end = '&hellip;';
    var endLen = 3;
    console.log(text, text.length, String(text).substring(0, length - endLen).trim() + end);
    if (text.length <= length) {
      return text;
    }
    else {
      return String(text).substring(0, length - endLen).trim() + end;
    }
  };
}];