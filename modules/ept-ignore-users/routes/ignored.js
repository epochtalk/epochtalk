var Joi = require('joi');

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

    var promise = request.db.ignoreUsers.ignored(userId, opts);
    return reply(promise);
  }
};
