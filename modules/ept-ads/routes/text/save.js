var Joi = require('joi');
var Boom = require('boom');
var path = require('path');
var adText = require(path.normalize(__dirname + '/../../text'));

function auth(request, reply) {
  var promise = request.server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: request.server,
    auth: request.auth,
    permission: 'ads.textSave.allow'
  });

  return reply(promise);
}

module.exports = {
  method: 'POST',
  path: '/api/ads/text',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      payload: {
        disclaimer: Joi.string().allow(''),
        info: Joi.string().allow('')
      }
    },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var text = request.payload;
    adText.setDisclaimer(text.disclaimer);
    adText.setInfo(text.info);
    return reply(text);
  }
};
