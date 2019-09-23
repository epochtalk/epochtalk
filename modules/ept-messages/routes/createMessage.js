var Joi = require('@hapi/joi');
var _ = require('lodash');

/**
  * @apiVersion 0.4.0
  * @apiGroup Messages
  * @api {POST} /messages Create
  * @apiName CreateMessage
  * @apiPermission User
  * @apiDescription Used to create a new message.
  *
  * @apiParam (Payload) {string} conversation_id The id of the conversation the message should be created in
  * @apiParam (Payload) {string} receiver_ids The ids of the users receiving the message/conversation
  * @apiParam (Payload) {object} content The contents of this message
  * @apiParam (Payload) {string} content.body The raw contents of this message
  * @apiParam (Payload) {string} content.body_html The html contents of this message
  *
  * @apiUse MessageObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue creating the message
  */
module.exports = {
  method: 'POST',
  path: '/api/messages',
  options: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: {
      payload: {
        conversation_id: Joi.string().required(),
        receiver_ids: Joi.array().items(Joi.string()).min(1).required(),
        content: Joi.object().keys({
          body: Joi.string().min(1).max(5000).required(),
          body_html: Joi.string()
        })
      }
    },
    pre: [
      { method: (request) => request.server.methods.auth.messages.create(request.server, request.auth, request.payload.receiver_ids, request.payload.conversation_id) },
      { method: (request) => request.server.methods.common.posts.checkPostLength(request.server, request.payload.body) },
      { method: (request) => request.server.methods.common.posts.clean(request.sanitizer, request.payload) },
      { method: (request) => request.server.methods.common.posts.parse(request.parser, request.payload) },
      { method: (request) => request.server.methods.common.images.sub(request.payload) }
    ]
  },
  handler: function(request) {
    var message = request.payload;
    message.sender_id = request.auth.credentials.id;

    // create the message in db
    var promise = request.db.messages.create(message)
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

    return promise;
  }
};
