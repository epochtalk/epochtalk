'use strict';
/* jslint node: true */

module.exports = [function () {
  return function(text, subStr, newSubStr) {
    if (!subStr || !newSubStr) { return text; }
    else { return text.split(subStr).join(newSubStr); }
  };
}];