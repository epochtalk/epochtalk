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
    permission: 'ads.factoidRemove.allow'
  });

  return reply(promise);
}

module.exports = {
  method: 'DELETE',
  path: '/api/ads/factoids/{id}',
  config: {
    auth: { strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var factoidId = request.params.id;
    var promise = db.factoids.remove(factoidId)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
