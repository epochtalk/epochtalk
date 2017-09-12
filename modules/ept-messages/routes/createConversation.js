var Joi = require('joi');
var _ = require('lodash');

/**
  * @apiDefine MessageObjectSuccess
  * @apiSuccess {string} id The unique id of the message
  * @apiSuccess {string} conversation_id The unique id of the conversation this message belongs to
  * @apiSuccess {string} sender_id The unique id of the user that sent this message
  * @apiSuccess {string} receiver_ids The unique ids of the users that will receive this message
  * @apiSuccess {string} body The contents of this message
  * @apiSuccess {string} subject The subject of this message
  * @apiSuccess {boolean} viewed The flag showing if the receiver viewed this message
  * @apiSuccess {timestamp} created_at Timestamp of when the conversation was created
  */

/**
  * @apiVersion 0.4.0
  * @apiGroup Conversations
  * @api {POST} /conversations Create
  * @apiName CreateConversation
  * @apiPermission User
  * @apiDescription Used to create a new conversation and the first message of the conversation.
  *
  * @apiParam (Payload) {string} receiver_ids The id of the users receiving the message/conversation
  * @apiParam (Payload) {string} body The content of the message/conversation
  * @apiParam (Payload) {string} subject The subject of the message
  *
  * @apiUse MessageObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue creating the conversation
  */
module.exports = {
  method: 'POST',
  path: '/api/conversations',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: {
      payload: {
        receiver_ids: Joi.array().items(Joi.string()).min(1).required(),
        body: Joi.string().min(1).max(5000).required(),
        subject: Joi.string().min(1).max(255).required()
      }
    },
    pre: [
      { method: 'auth.conversations.create(server, auth, payload.receiver_ids)' },
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
      request.payload.receiver_ids.forEach(function(receiverId) {
        var notification = {
          type: 'message',
          sender_id: request.auth.credentials.id,
          receiver_id: receiverId,
          channel: { type: 'user', id: receiverId },
          data: {
            action: 'newMessage',
            messageId: messageClone.id,
            conversationId: messageClone.conversation_id
          }
        };
        request.server.plugins.notifications.spawnNotification(notification);
      });
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
