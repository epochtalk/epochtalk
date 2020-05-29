var Joi = require('@hapi/joi');
var _ = require('lodash');

/**
  * @apiDefine MessageObjectSuccess
  * @apiSuccess {string} id The unique id of the message
  * @apiSuccess {string} conversation_id The unique id of the conversation this message belongs to
  * @apiSuccess {string} sender_id The unique id of the user that sent this message
  * @apiSuccess {string} receiver_ids The unique ids of the users that will receive this message
  * @apiSuccess {object} content The contents of this message
  * @apiSuccess {string} content.body The raw contents of this message
  * @apiSuccess {string} content.body_html The html contents of this message
  * @apiSuccess {string} content.subject The subject of this message
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
  * @apiParam (Payload) {object} content The contents of this message
  * @apiParam (Payload) {string} content.body The raw contents of this message
  * @apiParam (Payload) {string} content.body_html The html contents of this message
  * @apiParam (Payload) {string} content.subject The subject of this message
  *
  * @apiUse MessageObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue creating the conversation
  */
module.exports = {
  method: 'POST',
  path: '/api/conversations',
  options: {
    app: { hook: 'conversations.create' },
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: {
      payload: Joi.object({
        receiver_ids: Joi.array().items(Joi.string()).min(1).required(),
        content: Joi.object({
          body: Joi.string().min(1).max(5000).required(),
          body_html: Joi.string(),
          subject: Joi.string().min(1).max(255).required()
        })
      })
    },
    pre: [
      { method: (request) => request.server.methods.auth.conversations.create(request.server, request.auth, request.payload.receiver_ids) },
      { method: (request) => request.server.methods.common.posts.checkPostLength(request.server, request.payload.body) },
      { method: (request) => request.server.methods.common.posts.clean(request.sanitizer, request.payload) },
      { method: (request) => request.server.methods.common.posts.parse(request.parser, request.payload) },
      { method: (request) => request.server.methods.common.images.sub(request.payload) },
      { method: (request) => request.server.methods.hooks.preProcessing(request) },
      [
        { method: (request) => request.server.methods.hooks.parallelProcessing(request), assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: (request) => request.server.methods.hooks.merge(request) },
      { method: (request) => request.server.methods.hooks.postProcessing(request) }
    ]
  },
  handler: function(request) {
    return request.pre.processed;
  }
};

function processing(request) {
  var config = request.server.app.config;
  var message = request.payload;
  // create the conversation in db
  var promise = request.db.conversations.create(request.auth.credentials.id)
  .then(function(conversation) {
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
      return request.server.plugins.notifications.spawnNotification(notification)
      .then(function() { // send email
        var receiver = '';
        return request.db.users.find(receiverId)
        .then(function(receiverName) {
          receiver = receiverName;
          return request.db.messages.getMessageSettings(receiverId);
        })
        .then(function(data) {
          if (data.email_messages) {
            var emailParams = {
              email: receiver.email,
              sender: request.auth.credentials.username,
              subject: message.content.subject,
              // message: message.content.body_html, // do not send this for now, could contain sensitive data
              site_name: config.website.title,
              message_url: config.publicUrl + '/messages'
            };
            // Do not return, otherwise user has to wait for email to send
            // before post is created
            request.server.log('debug', emailParams)
            request.emailer.send('newPM', emailParams)
            .catch(console.log);
            return true;
          }
          return true;
        });
      });
    });
  })
  .error(request.errorMap.toHttpError);

  return promise;
}
