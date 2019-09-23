var Joi = require('@hapi/joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Messages
  * @api {GET} /messages Get Recent Messages
  * @apiName LatestMessages
  * @apiPermission User
  * @apiDescription Get the latest messages for this user.
  *
  * @apiParam (Query) {number} [page] The page of messages to return
  * @apiParam (Query) {number} [limit] The number of messages per page
  *
  * @apiUse MessageObjectSuccess
  * @apiSuccess {timestamp} updated_at Timestamp of the last message received
  * @apiSuccess {string} sender_username The username of the sender
  * @apiSuccess {boolean} sender_deleted Boolean indicating if the sender's account is deleted
  * @apiSuccess {string} sender_avatar The avatar of the sender
  * @apiSuccess {string} receiver_username The username of the receiver
  * @apiSuccess {boolean} receiver_deleted Boolean indicating if the receiver's account is deleted
  * @apiSuccess {string} receiver_avatar The avatar of the receiver
  *
  * @apiError (Error 500) InternalServerError There was an issue getting the messages
  */
module.exports = {
  method: 'GET',
  path: '/api/messages',
  options: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        page: Joi.number().integer().default(1),
        limit: Joi.number().integer().min(1).max(100).default(15)
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.messages.latest(request.server, request.auth) } ]
  },
  handler: function(request) {
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
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
