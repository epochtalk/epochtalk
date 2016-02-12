var bbcodeParser = require('epochtalk-bbcode-parser');

var parser = { parse: parse };

function parse(input) {
  if (!input) { return ''; }

  // convert all unicode characters to their numeric representation
  // this is so we can save it to the db and present it to any encoding
  input = textToEntities(input);

  if (input.indexOf('[') >= 0) {
    // convert all (<, &lt;) and (>, &gt;) to decimal to escape the regex
    // in the bbcode parser that'll unescape those chars
    input = input.replace(/(?:<|&lt;)/g, '&#60;');
    input = input.replace(/(?:>|&gt;)/g, '&#62;');

    // parse input to generate body
    input = bbcodeParser.process({text: input}).html;
  }

  return input;
}

function textToEntities(text) {
  var entities = '';
  for (var i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) > 127) {
      entities += '&#' + text.charCodeAt(i) + ';';
    }
    else { entities += text.charAt(i); }
  }

  return entities;
}

exports.register = function(server, options, next) {
  options = options || {};

  server.decorate('server', 'parser', parser);
  server.decorate('request', 'parser', parser);
  return next();
};

exports.register.attributes = {
  name: 'parser',
  version: '1.0.0'
};
