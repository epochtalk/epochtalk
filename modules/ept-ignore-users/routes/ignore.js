var Joi = require('joi');
var Promise = require('bluebird');

module.exports = {
  method: 'POST',
  path: '/api/ignoreUsers/ignore/{userId}',
  config: {
    auth: { strategy: 'jwt' },
    validate: { params: { userId: Joi.string().required() } },
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var ignoreUserId = request.params.userId;

    var promise = request.db.ignoreUsers.ignore(userId, ignoreUserId)
    .then(function() { return { userId: ignoreUserId, ignored: true }; })
    .error(function(err) {
      if (err.constraint) { return {}; }
      throw err;
    });

    return reply(promise);
  }
};
