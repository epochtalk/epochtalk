var Joi = require('joi');
var path = require('path');
var Hapi = require('hapi');
var Boom = require('boom');
var pre = require(path.normalize(__dirname + '/pre'));
var db = require(path.normalize(__dirname + '/../../../db'));
var postPre = require(path.normalize(__dirname + '/../posts/pre'));

exports.create = {
  auth: { strategy: 'jwt' },
  validate: {
    payload: Joi.object().keys({
      locked: Joi.boolean().default(false),
      sticky: Joi.boolean().default(false),
      title: Joi.string().min(1).max(255).required(),
      body: Joi.string().allow(''),
      raw_body: Joi.string().required(),
      board_id: Joi.string().required()
    })
  },
  pre: [
    { method: postPre.clean },
    { method: postPre.parseEncodings },
    { method: postPre.subImages }
  ],
  handler: function(request, reply) {
    // build the thread post object from payload and params
    var user = request.auth.credentials;
    var newThread = {
      board_id: request.payload.board_id,
      locked: request.payload.locked,
      sticky: request.payload.sticky
    };
    var newPost = {
      title: request.payload.title,
      body: request.payload.body,
      raw_body: request.payload.raw_body,
      user_id: user.id
    };

    // create the thread and first post in db
    db.threads.create(newThread)
    .then(function(thread) { newPost.thread_id = thread.id; })
    .then(function() { return db.posts.create(newPost); })
    .then(reply)
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.import = {
  // auth: { strategy: 'jwt' },
  // validate: {
  //   payload: Joi.object().keys({
  //     sticky: Joi.boolean().default(false),
  //     locked: Joi.boolean().default(false),
  //     board_id: Joi.string().required(),
  //     created_at: Joi.date(),
  //     updated_at: Joi.date(),
  //     view_count: Joi.number(),
  //     deleted: Joi.boolean(),
  //     smf: Joi.object().keys({
  //       ID_MEMBER: Joi.number(),
  //       ID_TOPIC: Joi.number(),
  //       ID_FIRST_MSG: Joi.number()
  //     })
  //   })
  // },
  handler: function(request, reply) {
    db.threads.import(request.payload)
    .then(reply)
    .catch(function(err) {
      request.log('error', 'Import board: ' + JSON.stringify(err, ['stack', 'message'], 2));
      reply(Boom.badImplementation(err));
    });
  }
};

exports.byBoard = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: {
    query: {
      board_id: Joi.string().required(),
      page: Joi.number().default(1),
      limit: Joi.number().integer().min(1).default(10)
    }
  },
  pre: [
    { method: pre.getThreads, assign: 'threads' },
    { method: pre.getUserThreadViews, assign: 'threadViews' }
  ],
  handler: function(request, reply) {
    if (!request.server.methods.viewable(request)) { return reply([]); }
    var threads = request.pre.threads;
    var threadViews = request.pre.threadViews;
    var user = request.auth.credentials;

    // iterate through threads and see if the thread has been viewed yet
    if (threadViews) {
      threads.normal = threads.normal.map(function(thread) {
        return setNewPost(user, threadViews, thread);
      });
      threads.sticky = threads.sticky.map(function(thread) {
        return setNewPost(user, threadViews, thread);
      });
    }

    return reply(threads);
  }
};

exports.find = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: { params: { id: Joi.string().required() } },
  pre: [
    [
      { method: pre.getThread, assign: 'thread' },
      { method: pre.checkViewValidity, assign: 'newViewId' },
      { method: pre.updateUserThreadViews }
    ]
  ],
  handler: function(request, reply) {
    if (!request.server.methods.viewable(request)) { return reply({}); }
    var thread = request.pre.thread;
    var newViewerId = request.pre.newViewId;
    if (newViewerId) { return reply(thread).header('Epoch-Viewer', newViewerId); }
    else { return reply(thread); }
  }
};

exports.lock = {
  auth: { strategy: 'jwt' },
  validate: {
    params: { id: Joi.string().required() },
    payload: { status: Joi.boolean().default(true) }
  },
  pre: [
    { method: pre.getThread, assign: 'thread' },
    { method: pre.isAdmin, assign: 'isAdmin' }
  ],
  handler: function(request, reply) {
    var thisUserId = request.auth.credentials.id;
    var thread = request.pre.thread;
    var isAdmin = request.pre.isAdmin;
    var canLock = false;
    var promise;

    // check if thread is lockable by user
    if (isAdmin) { canLock = true; }
    else if (thread.user.id === thisUserId) { canLock = true; }

    // lock thread
    if (canLock) {
      thread.locked = request.payload.status;
      promise = db.threads.lock(thread.id, thread.locked)
      .then(function() { return thread; });
    }
    else { promise = Boom.unauthorized(); }

    return reply(promise);
  }
};

exports.sticky = {
  auth: { strategy: 'jwt' },
  validate: {
    params: { id: Joi.string().required() },
    payload: { status: Joi.boolean().default(true) }
  },
  pre: [
    { method: pre.getThread, assign: 'thread' },
    { method: pre.isAdmin, assign: 'isAdmin' }
  ],
  handler: function(request, reply) {
    var thread = request.pre.thread;
    var isAdmin = request.pre.isAdmin;
    var promise;

    // lock thread
    if (isAdmin) {
      thread.sticky = request.payload.status;
      promise = db.threads.sticky(thread.id, thread.sticky)
      .then(function() { return thread; });
    }
    else { promise = Boom.unauthorized(); }

    return reply(promise);
  }
};

exports.move = {
  auth: { strategy: 'jwt' },
  validate: {
    params: { id: Joi.string().required() },
    payload: { newBoardId: Joi.string().required() }
  },
  pre: [
    { method: pre.getThread, assign: 'thread' },
    { method: pre.isAdmin, assign: 'isAdmin' }
  ],
  handler: function(request, reply) {
    var thread = request.pre.thread;
    var isAdmin = request.pre.isAdmin;
    var newBoardId = request.payload.newBoardId;
    var promise;

    // reject of newBoardId matches old board_id
    if (isAdmin && thread.board_id === newBoardId) {
      promise = Boom.badRequest('New Board is the same as current board');
    }
    // lock thread
    else if (isAdmin) {
      thread.board_id = newBoardId;
      promise = db.threads.move(thread.id, thread.board_id)
      .then(function() { return thread; })
      .catch(console.log);
    }
    else { promise = Boom.unauthorized(); }

    return reply(promise);
  }
};


function setNewPost(user, threadViews, thread) {
  // If user made last post consider thread viewed
  if (user.username === thread.last_post_username) {
    thread.has_new_post = false;
  }
  else if (!threadViews[thread.id]) {
    thread.has_new_post = true;
  }
  else if (threadViews[thread.id] &&
           threadViews[thread.id] <= thread.last_post_created_at) {
    thread.has_new_post = true;
  }
  return thread;
}
