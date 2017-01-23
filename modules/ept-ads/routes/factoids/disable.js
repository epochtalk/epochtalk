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
    permission: 'ads.factoidDisable.allow'
  });

  return reply(promise);
}

module.exports = {
  method: 'PUT',
  path: '/api/ads/factoids/{id}/disable',
  config: {
    auth: { strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var promise;
    var factoidId = request.params.id;

    if (factoidId === 'all') {
      promise = db.factoids.disableAll();
    }
    else {
      promise = db.factoids.disable(factoidId);
    }

    return reply(promise);
  }
};
