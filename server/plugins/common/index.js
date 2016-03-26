// -- internal methods

function categoriesClean(sanitizer, payload) {
  payload.map(function(cat) {
    cat.name = sanitizer.strip(cat.name);
  });
}

function messagesClean(sanitizer, payload) {
  payload.body = sanitizer.bbcode(payload.body);
}

function messagesParse(parser, payload) {
  payload.body = parser.parse(payload.body);
}

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

exports.register = function(server, options, next) {
  options = options || {};
  options.methods = options.methods || [];

  // append hardcoded methods to the server
  var internalMethods = [
    // -- categories
    {
      name: 'common.categories.clean',
      method: categoriesClean,
      options: { callback: false }
    },
    // -- messages
    {
      name: 'common.messages.clean',
      method: messagesClean,
      options: { callback: false }
    },
    {
      name: 'common.messages.parse',
      method: messagesParse,
      options: { callback: false }
    },
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

  next();
};

exports.register.attributes = {
  name: 'common',
  version: '1.0.0'
};
