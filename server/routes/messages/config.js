var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var Promise = require('bluebird');
var common = require(path.normalize(__dirname + '/../../common'));

/**
  * @apiVersion 0.4.0
  * @apiGroup Messages
  * @api {POST} /messages Create
  * @apiName CreateMessage
  * @apiPermission User
  * @apiDescription Used to create a new message.
  *
  * @apiUse MessageObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue creating the message
  */
exports.create = {
  app: { user_id: 'payload.receiver_id' },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'messages.create' },
  validate: {
    payload: {
      conversation_id: Joi.string().required(),
      receiver_id: Joi.string().required(),
      body: Joi.string().min(1).required()
    }
  },
  pre: [
    { method: 'auth.messages.create(server, auth, payload.receiver_id, payload.conversation_id)' },
    { method: common.cleanMessage },
    { method: common.parseMessage }
  ],
  handler: function(request, reply) {
    var message = request.payload;
    message.sender_id = request.auth.credentials.id;

    // create the message in db
    var promise = request.db.messages.create(message);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Messages
  * @api {GET} /messages Get Recent Messages
  * @apiName LatestMessages
  * @apiPermission User
  * @apiDescription Get the latest messages for this user.
  *
  * @apiUse MessageObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue getting the messages
  */
exports.latest = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'messages.latest' },
  validate: {
    query: {
      page: Joi.number().integer().default(1),
      limit: Joi.number().integer().min(1).max(100).default(15)
    }
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var opts = {
      limit: request.query.limit,
      page: request.query.page
    };

    // get latest messages for userId
    var getMessages = request.db.messages.latest(userId, opts);
    var getCount = request.db.messages.conversationCount(userId);
    var promise = Promise.join(getMessages, getCount, function(messages, count) {
      return {
        messages: messages,
        total_convo_count: count,
        page: opts.page,
        limit: opts.limit
      };
    });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Messages
  * @api {GET} /messages/users/{username} Get ID for username
  * @apiName FindUserMessages
  * @apiPermission User
  * @apiDescription Get the id for the given username
  *
  * @apiUse MessageObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue getting the messages
  */
exports.findUser = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'messages.findUser' },
  validate: { params: { username: Joi.string().required() } },
  handler: function(request, reply) {
    // get id for username
    var username = request.params.username;
    var promise = request.db.messages.findUser(username);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
  * @apiGroup Messages
  * @api {DELETE} /messages/:id Delete
  * @apiName DeleteMessage
  * @apiPermission User (Message's Author) or Admin
  * @apiDescription Used to delete a message.
  *
  * @apiParam {string} id The Id of the message to delete
  *
  * @apiUse MessageObjectSuccess
  *
  * @apiError (Error 400) BadRequest Message Already Deleted
  * @apiError (Error 500) InternalServerError There was an issue deleting the message
  */
exports.delete = {
  auth: { strategy: 'jwt' },
  plugins: { acls: 'messages.delete' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: 'auth.messages.delete(server, auth, params.id)' } ],
  handler: function(request, reply) {
    var promise = request.db.messages.delete(request.params.id)
    .error(function(err) { return Boom.badRequest(err.message); });
    return reply(promise);
  }
};

/**
  * @apiDefine MessageObjectSuccess
  * @apiSuccess {string} id The unique id of the message
  * @apiSuccess {string} conversation_id The unique id of the conversation this message belongs to
  * @apiSuccess {string} sender_id The unique id of the user that sent this message
  * @apiSuccess {string} receiver_id The unique id of the user that sent this message
  * @apiSuccess {string} body The contents of this message
  * @apiSuccess {boolean} viewed The flag showing if the receiver viewed this message
  * @apiSuccess {timestamp} created_at Timestamp of when the conversation was created
  */
