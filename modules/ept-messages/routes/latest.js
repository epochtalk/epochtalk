var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Messages
  * @api {GET} /messages Get Recent Messages
  * @apiName LatestMessages
  * @apiPermission User
  * @apiDescription Get the latest messages for this user.
  *
  * @apiUse MessageObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue getting the messages
  */
module.exports = {
  method: 'GET',
  path: '/api/messages',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        page: Joi.number().integer().default(1),
        limit: Joi.number().integer().min(1).max(100).default(15)
      }
    },
    pre: [ { method: 'auth.messages.latest(server, auth)' } ]
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var opts = {
      limit: request.query.limit,
      page: request.query.page
    };

    // get latest messages for userId
    var getMessages = request.db.messages.latest(userId, opts);
    var getCount = request.db.messages.conversationCount(userId);
    var promise = Promise.join(getMessages, getCount, function(messages, count) {
      return {
        messages: messages,
        total_convo_count: count,
        page: opts.page,
        limit: opts.limit
      };
    });
    return reply(promise);
  }
};
