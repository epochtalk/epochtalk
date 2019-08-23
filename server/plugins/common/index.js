module.exports = {
  name: 'common',
  version: '1.0.0',
  register: async function(server, options) {
    options = options || {};
    options.methods = options.methods || [];
    server.method(options.methods);
  }
};
