var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var db = require(path.normalize(__dirname + '/../../../db'));
var messagePre = require(path.normalize(__dirname + '/../messages/pre'));

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
exports.create = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'conversations.create' },
  validate: {
    payload: {
      receiver_id: Joi.string().required(),
      copied_ids: Joi.array().items(Joi.string()).default([]),
      body: Joi.string().min(1).required()
    }
  },
  pre: [
    { method: messagePre.clean },
    { method: messagePre.parseEncodings }
  ],
  handler: function(request, reply) {
    // create the conversation in db
    var promise = db.conversations.create()
    .then(function(conversation) {
      var message = request.payload;
      message.conversation_id = conversation.id;
      message.sender_id = request.auth.credentials.id;
      return message;
    })
    .then(db.messages.create);
    return reply(promise);
  }
};

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
exports.messages = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'conversations.messages' },
  validate: {
    params: { conversationId: Joi.string() },
    query: {
      timestamp: Joi.date(),
      messageId: Joi.string(),
      limit: Joi.number().integer().min(1).max(100).default(15)
    }
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
    var promise = db.conversations.messages(conversationId, userId, opts)
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
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Conversations
  * @api {DELETE} /conversations/:id Delete
  * @apiName DeleteConversation
  * @apiPermission Admin
  * @apiDescription Used to delete a conversation.
  *
  * @apiParam {string} id The Id of the conversation to delete
  *
  * @apiUse ConversationObjectSuccess
  *
  * @apiError (Error 400) BadRequest Conversation Already Deleted
  * @apiError (Error 500) InternalServerError There was an issue deleting the conversation
  */
exports.delete = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'conversations.delete' },
  validate: { params: { id: Joi.string().required() } },
  handler: function(request, reply) {
    var promise = db.conversations.delete(request.params.id)
    .error(function(err) { return Boom.badRequest(err.message); });
    return reply(promise);
  }
};

/**
  * @apiDefine ConversationObjectSuccess
  * @apiSuccess {string} id The unique id of the conversation
  * @apiSuccess {timestamp} created_at Timestamp of when the conversation was created
  */
