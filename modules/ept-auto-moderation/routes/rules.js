var path = require('path');
var Boom = require('boom');
var db = require(path.normalize(__dirname + '/../db'));

// Auth Function
function auth(request, reply) {
  var promise = request.server.authorization.build({
    error: Boom.forbidden(),
    type: 'hasPermission',
    server: request.server,
    auth: request.auth,
    permission: 'autoModeration.rules.allow'
  });

  return reply(promise);
}

module.exports = {
  method: 'GET',
  path: '/api/automoderation/rules',
  config: {
    auth: { strategy: 'jwt' },
    pre: [ { method: auth } ]
  },
  handler: function(request, reply) {
    var promise = db.rules()
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
