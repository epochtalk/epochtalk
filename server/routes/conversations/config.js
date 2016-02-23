var Joi = require('joi');
var Boom = require('boom');
var _ = require('lodash');

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
  app: { user_id: 'payload.receiver_id' },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'conversations.create' },
  validate: {
    payload: {
      receiver_id: Joi.string().required(),
      body: Joi.string().min(1).required()
    }
  },
  pre: [
    { method: 'auth.conversations.create(server, auth, payload.receiver_id)' },
    { method: 'common.messages.clean(sanitizer,payload)' },
    { method: 'common.messages.parse(parser, payload)' }
  ],
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
      var messageClone = _.cloneDeep(dbMessage)
      var notification = {
        type: 'message',
        sender_id: request.auth.credentials.id,
        receiver_id: request.payload.receiver_id,
        data: {
          id: messageClone.id
        }
      };
      request.server.plugins.notifications.spawnNotification(notification);
    });
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
  * @apiSuccess {string} id The unique id of the conversation being deleted
  * @apiSuccess {string} sender_id The unique id of the sender
  * @apiSuccess {string} receiver_id The unique id of the receiver
  *
  * @apiError (Error 400) BadRequest Conversation Already Deleted
  * @apiError (Error 500) InternalServerError There was an issue deleting the conversation
  */
exports.delete = {
  auth: { strategy: 'jwt' },
  plugins: {
    acls: 'conversations.delete',
    mod_log: {
      type: 'conversations.delete',
      data: {
        id: 'params.id',
        sender_id: 'route.settings.plugins.mod_log.metadata.sender_id',
        receiver_id: 'route.settings.plugins.mod_log.metadata.receiver_id'
       }
    }
  },
  validate: { params: { id: Joi.string().required() } },
  handler: function(request, reply) {
    var promise = request.db.conversations.delete(request.params.id)
    .then(function(deletedConvo) {
      // append receiver and sender ids to plugin metadata
      request.route.settings.plugins.mod_log.metadata = {
        sender_id: deletedConvo.sender_id,
        receiver_id: deletedConvo.receiver_id
      };
      return deletedConvo;
    })
    .error(function(err) { return Boom.badRequest(err.message); });
    return reply(promise);
  }
};

/**
  * @apiDefine ConversationObjectSuccess
  * @apiSuccess {string} id The unique id of the conversation
  * @apiSuccess {timestamp} created_at Timestamp of when the conversation was created
  */
