var Boom = require('boom');
var path = require('path');
var crypto = require('crypto');

module.exports = function(internalConfig) {
  return {
    method: 'POST',
    path: '/api/images/upload',
    config: {
      auth: { strategy: 'jwt' },
      payload: {
        maxBytes: internalConfig.images.maxSize,
        output: 'stream',
        parse: true
      }
    },
    handler: function(request, reply) {
      // check we're using local storage
      var config = request.server.app.config;
      if (config.images.storage !== 'local') {
        return reply(Boom.notFound());
      }

      // make sure image file exists
      var file = request.payload.file;
      if (!file) { return reply(Boom.badRequest('No File Attached')); }

      // decode policy
      var policyPayload = request.payload.policy;
      var decipher = crypto.createDecipher('aes-256-ctr', config.privateKey);
      var decoded = decipher.update(policyPayload,'hex','utf8');
      decoded += decipher.final('utf8');

      // parse policy
      var policy;
      try { policy = JSON.parse(decoded); }
      catch(e) { return reply(Boom.badRequest('Malformed Policy')); }
      if (!policy) { return reply(Boom.badRequest('Malformed Policy')); }

      // check filename
      var filename = policy.filename;
      if (!filename) { return reply(Boom.badRequest('Invalid Policy')); }

      // check policy expiration
      var expiration = new Date(policy.expiration);
      if (expiration < Date.now()) {
        return reply(Boom.badRequest('Policy Timed Out'));
      }

      request.imageStore.uploadImage(file, filename, reply);
    }
  };
};
