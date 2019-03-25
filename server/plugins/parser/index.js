var parsers = [];

function parse(input) {
  if (!input) { input = ''; }

  // convert all unicode characters to their numeric representation
  // this is so we can save it to the db and present it to any encoding
  input = encode(input);

  // run through all parsers
  parsers.forEach(function(parser) { input = parser.parse(input); });

  return input;
}

function encode(e) { return e.replace(/[.]/g, function(e) { return"&#"+e.charCodeAt(0)+";" }); }

exports.register = function(server, options, next) {
  options = options || {};
  parsers = options.parsers;

  server.decorate('server', 'parser', { parse });
  server.decorate('request', 'parser', { parse });
  return next();
};

exports.register.attributes = {
  name: 'parser',
  version: '1.0.0'
};
