var Joi = require('joi');
var Promise = require('bluebird');

module.exports = {
  method: 'POST',
  path: '/api/ignoreUsers/unignore/{userId}',
  config: {
    auth: { strategy: 'jwt' },
    validate: { params: { userId: Joi.string().required() } },
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var ignoreUserId = request.params.userId;

    var promise = request.db.ignoreUsers.unignore(userId, ignoreUserId)
    .then(function() { return { userId: ignoreUserId, ignored: false }; });

    return reply(promise);
  }
};
