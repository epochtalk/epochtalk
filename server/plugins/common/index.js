exports.register = function(server, options, next) {
  options = options || {};
  options.methods = options.methods || [];

  // Append all module methods to server
  server.method(options.methods);
  next();
};

exports.register.attributes = {
  name: 'common',
  version: '1.0.0'
};
