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
    permission: 'ads.roundRotate.allow'
  });

  return reply(promise);
}

module.exports = {
  method: 'POST',
  path: '/api/ads/rounds/rotate',
  config: {
    auth: { strategy: 'jwt' },
    validate: { payload: { round: Joi.number().required() } },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var round = request.payload.round;
    var promise = db.rounds.rotate(round)
    .error(function(err) { return Boom.badRequest(err.message); });
    return reply(promise);
  }
};
