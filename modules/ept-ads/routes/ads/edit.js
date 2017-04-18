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
    permission: 'ads.edit.allow'
  });

  return reply(promise);
}

module.exports = {
  method: 'PUT',
  path: '/api/ads/{id}',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      params: { id: Joi.string().required() },
      payload: {
        html: Joi.string().required(),
        css: Joi.string().allow('')
      }
    },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var ad = request.payload;
    ad.id = request.params.id;
    var promise = db.ads.edit(ad)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
