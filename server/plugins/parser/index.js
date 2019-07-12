var parsers = [];

module.exports = {
  name: 'parser',
  version: '1.0.0',
  register: async function(server, options) {
    options = options || {};
    parsers = options.parsers;

    server.decorate('server', 'parser', { parse });
    server.decorate('request', 'parser', { parse });
  }
};

function parse(input) {
  if (!input) { input = ''; }

  // convert all unicode characters to their numeric representation
  // this is so we can save it to the db and present it to any encoding
  input = textToEntities(input);

  // run through all parsers
  parsers.forEach(function(parser) {
    input = parser.parse(input);
  });

  return input;
}

function textToEntities(text) {
  var entities = '';
  for (var i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) > 127) {
      entities += encode(text.charAt(i));
    }
    else { entities += text.charAt(i); }
  }

  return entities;
}

function encode(e) {
  return e.replace(/[.]/g, function(e) { return "&#" + e.charCodeAt(0) + ";" });
}
