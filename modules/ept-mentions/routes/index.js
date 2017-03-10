var Joi = require('joi');

var page = {
  method: 'GET',
  path: '/api/mentions',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: {
      query: {
        limit: Joi.number(),
        page: Joi.number(),
        extended: Joi.boolean()
      }
    }
  },
  handler: function(request, reply) {
    var mentioneeId = request.auth.credentials.id;
    var opts = {
      limit: request.query.limit,
      page: request.query.page,
      extended: request.query.extended
    };
    var promise = request.db.mentions.page(mentioneeId, opts);
    return reply(promise);
  }
};

var remove = {
  method: 'DELETE',
  path: '/api/mentions',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: { params: { id: Joi.string().required() } },
  },
  handler: function(request, reply) {
    var mentionId = request.params.id;

    var promise = request.db.mentions.page(mentionId);
    return reply(promise);
  }
};


module.exports = [page, remove];
