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
    permission: 'ads.factoidCreate.allow'
  });

  return reply(promise);
}

module.exports = {
  method: 'POST',
  path: '/api/ads/factoids',
  config: {
    auth: { strategy: 'jwt' },
    validate: { payload: { text: Joi.string().required() } },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var factoid = request.payload;
    var promise = db.factoids.create(factoid);
    return reply(promise);
  }
};
