'use strict';
/* jslint node: true */

module.exports = [function () {
  var e = document.createElement('textarea'); // only create one textarea

  return function(text) {
    e.innerHTML = text;
    return e.childNodes[0].nodeValue;
  };
}];
