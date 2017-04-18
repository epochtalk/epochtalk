var Joi = require('joi');
var Boom = require('boom');
var path = require('path');
var db = require(path.normalize(__dirname + '/../../db'));

function auth(request, reply) {
  var promise = request.server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: request.server,
    auth: request.auth,
    permission: 'ads.create.allow'
  });

  return reply(promise);
}

module.exports = {
  method: 'POST',
  path: '/api/ads',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      payload: {
        round: Joi.number().required(),
        html: Joi.string().required(),
        css: Joi.string().allow('')
      }
    },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var ad = request.payload;
    var promise = db.ads.create(ad)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
