var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Conversations
  * @api {GET} /conversations/:id Messages in Conversation
  * @apiName GetConversationMessages
  * @apiPermission User
  * @apiDescription Used to get messages for this conversation.
  *
  * @apiParam {string} id The id of the conversation to get
  * @apiParam (Query) {timestamp} [timestamp] The timestamp to look for messages before
  * @apiParam (Query) {string} [message_id] The id of the last message
  * @apiParam (Query) {number} [limit=15] How many messages to return per page
  *
  * @apiSuccess {string} id The id of the conversation
  * @apiSuccess {boolean} has_next Boolean indicating if there are more messages
  * @apiSuccess {timestamp} last_message_timestamp timestamp of the last message
  * @apiSuccess {timestamp} last_message_id timestamp of the last message
  * @apiSuccess {string} subject The subject of the conversation
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
  path: '/api/conversations/{id}',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      params: { id: Joi.string() },
      query: {
        timestamp: Joi.date(),
        message_id: Joi.string(),
        limit: Joi.number().integer().min(1).max(100).default(15)
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.conversations.messages(request.server, request.auth) } ],
  },
  handler: function(request, reply) {
    var conversationId = request.params.id;
    var userId = request.auth.credentials.id;
    var opts = {
      timestamp: request.query.timestamp,
      messageId: request.query.message_id,
      limit: request.query.limit + 1 // plus for has_next testing
    };

    // create the conversation in db
    var promise = request.db.conversations.messages(conversationId, userId, opts)
    .then(function(messages) {
      // default return values
      var payload = { id: request.params.conversationId };

      // handle message has_next and possible extra message
      if (messages.length === opts.limit) {
        messages.pop();
        payload.messages = messages;
        payload.has_next = true;
      }
      else {
        payload.messages = messages;
        payload.has_next = false;
      }

      // last message values if there are any messages
      if (messages.length) {
        payload.last_message_timestamp = messages[messages.length - 1].created_at;
        payload.last_message_id = messages[messages.length - 1].id;
        payload.subject = messages[0].subject;
      }

      return payload;
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
