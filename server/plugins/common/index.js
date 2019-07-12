// -- internal methods

function imagesSite(imageStore, payload) {
  // clear the expiration on logo/favicon
  if (payload.website.logo) {
    imageStore.clearExpiration(payload.website.logo);
  }
  if (payload.website.favicon) {
    imageStore.clearExpiration(payload.website.favicon);
  }
}

// -- API

module.exports = {
  name: 'common',
  version: '1.0.0',
  register: async function(server, options) {
    options = options || {};
    options.methods = options.methods || [];

    // append hardcoded methods to the server
    var internalMethods = [
      // -- images
      {
        name: 'common.images.site',
        method: imagesSite,
        options: { callback: false }
      }
    ];

    // append any new methods to methods from options
    var methods = [].concat(options.methods, internalMethods);
    server.method(methods);
  }
};
