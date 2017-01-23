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
    permission: 'ads.factoidEdit.allow'
  });

  return reply(promise);
}

module.exports = {
  method: 'PUT',
  path: '/api/ads/factoids/{id}',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      params: { id: Joi.string().required() },
      payload: { text: Joi.string().required() }
    },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var factoid = request.payload;
    factoid.id = request.params.id;
    var promise = db.factoids.edit(factoid);
    return reply(promise);
  }
};
