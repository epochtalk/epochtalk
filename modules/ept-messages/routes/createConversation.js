var Joi = require('joi');
var _ = require('lodash');

/**
  * @apiDefine ConversationObjectSuccess
  * @apiSuccess {string} id The unique id of the conversation
  * @apiSuccess {timestamp} created_at Timestamp of when the conversation was created
  */

/**
  * @apiVersion 0.4.0
  * @apiGroup Conversations
  * @api {POST} /conversations Create
  * @apiName CreateConversation
  * @apiPermission User
  * @apiDescription Used to create a new conversation.
  *
  * @apiUse ConversationObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue creating the conversation
  */
module.exports = {
  method: 'POST',
  path: '/api/conversations',
  config: {
    app: { user_id: 'payload.receiver_id' },
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: {
      payload: {
        receiver_id: Joi.string().required(),
        body: Joi.string().min(1).max(5000).required()
      }
    },
    pre: [
      { method: 'auth.conversations.create(server, auth, payload.receiver_id)' },
      { method: 'common.messages.clean(sanitizer,payload)' },
      { method: 'common.messages.parse(parser, payload)' }
    ]
  },
  handler: function(request, reply) {
    // create the conversation in db
    var promise = request.db.conversations.create()
    .then(function(conversation) {
      var message = request.payload;
      message.conversation_id = conversation.id;
      message.sender_id = request.auth.credentials.id;
      return message;
    })
    .then(request.db.messages.create)
    .tap(function(dbMessage) {
      var messageClone = _.cloneDeep(dbMessage);
      var notification = {
        type: 'message',
        sender_id: request.auth.credentials.id,
        receiver_id: request.payload.receiver_id,
        channel: { type: 'user', id: request.payload.receiver_id },
        data: {
          action: 'newMessage',
          messageId: messageClone.id,
          conversationId: messageClone.conversation_id
        }
      };
      request.server.plugins.notifications.spawnNotification(notification);
    });
    return reply(promise);
  }
};
