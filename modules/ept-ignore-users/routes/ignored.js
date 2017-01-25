var Joi = require('joi');
var Promise = require('bluebird');

module.exports = {
  method: 'GET',
  path: '/api/ignoreUsers/ignored',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        limit: Joi.number().default(25),
        page: Joi.number().default(1)
      }
    },
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var opts = {
      page: request.query.page,
      limit: request.query.limit
    };

    var promise = request.db.ignoreUsers.ignored(userId, opts)
    .then(function(users) {
      var hasMore = false;
      if (users.length > request.query.limit) { hasMore = true;
      }
      return {
        hasMore: hasMore,
        page: request.query.page,
        limit: request.query.limit,
        ignored: users
      };
    });

    return reply(promise);
  }
};
