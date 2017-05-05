var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Conversations
  * @api {GET} /conversations Messages in Conversation
  * @apiName GetConversationMessages
  * @apiPermission User
  * @apiDescription Used to get messages for this conversation.
  *
  * @apiParam (Query) {timestamp} The timestamp to look for messages before
  * @apiParam (Query) {string} The id of the last message
  * @apiParam (Query) {number} How many messages to return per page
  *
  * @apiSuccess {string} id The id of the conversation
  * @apiSuccess {boolean} hasNext Boolean indicating if there are more messages
  * @apiSuccess {timestamp} last_message_timestamp timestamp of the last message
  * @apiSuccess {timestamp} last_message_id timestamp of the last message
  * @apiSuccess {object[]} messages An array of messages in this conversation
  * @apiSuccess {string} messages.id The unique id of the message
  * @apiSuccess {string} messages.conversation_id The unique id of the conversation this message belongs to
  * @apiSuccess {string} messages.sender_id The unique id of the user that sent this message
  * @apiSuccess {string} messages.receiver_id The unique id of the user that sent this message
  * @apiSuccess {string} messages.body The contents of this message
  * @apiSuccess {boolean} messages.viewed The flag showing if the receiver viewed this message
  * @apiSuccess {timestamp} messages.created_at Timestamp of when the conversation was created
  * @apiSuccess {string} messages.sender_username The username of the sender
  * @apiSuccess {boolean} messages.sender_deleted Boolean indicating if the sender's account is deleted
  * @apiSuccess {string} messages.sender_avatar The avatar of the sender
  * @apiSuccess {string} messages.receiver_username The username of the receiver
  * @apiSuccess {boolean} messages.receiver_deleted Boolean indicating if the receiver's account is deleted
  * @apiSuccess {string} messages.receiver_avatar The avatar of the receiver
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
