var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Conversations
  * @api {GET} /conversations Messages in Conversation
  * @apiName GetRecentMessages
  * @apiPermission User
  * @apiDescription Used to get messages for this conversation.
  *
  * @apiUse ConversationObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue getting messages for this conversation
  */
module.exports = {
  method: 'GET',
  path: '/api/conversations/{conversationId}',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      params: { conversationId: Joi.string() },
      query: {
        timestamp: Joi.date(),
        messageId: Joi.string(),
        limit: Joi.number().integer().min(1).max(100).default(15)
      }
    },
    pre: [ { method: 'auth.conversations.messages(server, auth)' } ],
  },
  handler: function(request, reply) {
    var conversationId = request.params.conversationId;
    var userId = request.auth.credentials.id;
    var opts = {
      timestamp: request.query.timestamp,
      messageId: request.query.messageId,
      limit: request.query.limit + 1 // plus for hasNext testing
    };

    // create the conversation in db
    var promise = request.db.conversations.messages(conversationId, userId, opts)
    .then(function(messages) {
      // default return values
      var payload = { id: request.params.conversationId };

      // handle message hasNext and possible extra message
      if (messages.length === opts.limit) {
        messages.pop();
        payload.messages = messages;
        payload.hasNext = true;
      }
      else {
        payload.messages = messages;
        payload.hasNext = false;
      }

      // last message values if there are any messages
      if (messages.length) {
        payload.last_message_timestamp = messages[messages.length - 1].created_at;
        payload.last_message_id = messages[messages.length - 1].id;
      }

      return payload;
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
