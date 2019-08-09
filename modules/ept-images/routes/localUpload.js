var Boom = require('boom');
var path = require('path');
var crypto = require('crypto');

module.exports = function(internalConfig) {
  return {
    method: 'POST',
    path: '/api/images/upload',
    options: {
      auth: { strategy: 'jwt' },
      payload: {
        maxBytes: internalConfig.images.maxSize,
        output: 'stream',
        parse: true
      }
    },
    handler: function(request, h) {
      // check we're using local storage
      var config = request.server.app.config;
      if (config.images.storage !== 'local') {
        return Boom.notFound();
      }

      // make sure image file exists
      var file = request.payload.file;
      if (!file) { return Boom.badRequest('No File Attached'); }

      // decode policy
      let policyParts = request.payload.policy.split(':');
      let iv = Buffer.from(policyParts[0], 'hex');
      let policyPayload = policyParts[1];
      let keyHash = crypto.createHash('md5').update(config.privateKey, 'utf-8').digest('hex').toUpperCase();
      let decipher = crypto.createDecipheriv('aes-256-ctr', keyHash, iv);
      var decoded = decipher.update(policyPayload,'hex','utf8');
      decoded += decipher.final('utf8');

      // parse policy
      var policy;
      try { policy = JSON.parse(decoded); }
      catch(e) { return Boom.badRequest('Malformed Policy'); }
      if (!policy) { return Boom.badRequest('Malformed Policy'); }

      // check filename
      var filename = policy.filename;
      if (!filename) { return Boom.badRequest('Invalid Policy'); }

      // check policy expiration
      var expiration = new Date(policy.expiration);
      if (expiration < Date.now()) {
        return Boom.badRequest('Policy Timed Out');
      }

      return request.imageStore.uploadImage(file, filename, h);
    }
  };
};
