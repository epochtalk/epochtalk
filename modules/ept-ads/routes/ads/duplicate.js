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
    permission: 'ads.duplicate.allow'
  });

  return reply(promise);
}

module.exports = {
  method: 'POST',
  path: '/api/ads/{id}/duplicate',
  config: {
    auth: { strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var adId = request.params.id;
    var promise = db.ads.duplicate(adId)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
