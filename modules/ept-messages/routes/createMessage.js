var Joi = require('joi');
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
  * @apiParam (Payload) {string} receiver_id The id of the user receiving the message/conversation
  * @apiParam (Payload) {string} body The content of the message/conversation
  *
  * @apiUse MessageObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue creating the message
  */
module.exports = {
  method: 'POST',
  path: '/api/messages',
  config: {
    app: { user_id: 'payload.receiver_id' },
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: {
      payload: {
        conversation_id: Joi.string().required(),
        receiver_id: Joi.string().required(),
        body: Joi.string().min(1).max(5000).required()
      }
    },
    pre: [
      { method: 'auth.messages.create(server, auth, payload.receiver_id, payload.conversation_id)' },
      { method: 'common.messages.clean(sanitizer, payload)' },
      { method: 'common.messages.parse(parser, payload)' }
    ]
  },
  handler: function(request, reply) {
    var message = request.payload;
    message.sender_id = request.auth.credentials.id;

    // create the message in db
    var promise = request.db.messages.create(message)
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
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
