'use strict';
/* jslint node: true */

module.exports = [function () {
  var e = document.createElement('textarea'); // only create one textarea

  return function(text) {
    text = text || '';
    text = text.replace(/(?:&)/gi, '&amp;').replace(/(?:&amp;lt;)/gi, '<').replace(/(?:&amp;gt;)/gi, '>');
    e.innerHTML = text;
    return e.childNodes[0] ? e.childNodes[0].nodeValue : '';
  };
}];
