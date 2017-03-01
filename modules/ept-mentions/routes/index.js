var Joi = require('joi');

var find = {
  method: 'GET',
  path: '/api/mentions',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: {
      query: {
        limit: Joi.number()
      }
    }
  },
  handler: function(request, reply) {
    var mentioneeId = request.auth.credentials.id;
    var limit = request.query.limit;
    var promise = request.db.mentions.latest(mentioneeId, limit);
    return reply(promise);
  }
};

var remove = {
  method: 'DELETE',
  path: '/api/mentions',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true }
  },
  handler: function(request, reply) {
    var mentioneeId = request.auth.credentials.id;

    // find the mention by the mentionee ID in db
    // QUERY LATEST
    var promise = request.server.plugins.notifications.latest();
    return reply(promise);
  }
};


module.exports = [find, remove];
