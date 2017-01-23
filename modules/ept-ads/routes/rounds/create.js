var Boom = require('boom');
var path = require('path');
var db = require(path.normalize(__dirname + '/../../db'));

function auth(request, reply) {
  var promise = request.server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: request.server,
    auth: request.auth,
    permission: 'ads.roundCreate.allow'
  });

  return reply(promise);
}

module.exports = {
  method: 'POST',
  path: '/api/ads/rounds',
  config: {
    auth: { strategy: 'jwt' },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var promise = db.rounds.create();
    return reply(promise);
  }
};
