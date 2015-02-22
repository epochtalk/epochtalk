var path = require('path');
var db = require(path.join(__dirname, '..', '..', '..', 'db'));
var Hapi = require('hapi');
var Boom = require('boom');
var threadValidator = require('epochtalk-validator').api.threads;
var postPre = require(path.join(__dirname, '..', 'posts', 'pre'));
var pre = require(path.join(__dirname, 'pre'));

// Route handlers/configs
exports.create = {
  auth: { strategy: 'jwt' },
  validate: { payload: threadValidator.schema.create },
  pre: [
    { method: postPre.clean },
    { method: postPre.parseEncodings },
    { method: postPre.subImages }
  ],
  handler: function(request, reply) {
    // build the thread post object from payload and params
    var user = request.auth.credentials;
    var newThread = { board_id: request.payload.board_id };
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
    .then(function(post) { reply(post); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.import = {
  // auth: { strategy: 'jwt' },
  // validate: { payload: threadValidator.schema.import },
  handler: function(request, reply) {
    db.threads.import(request.payload)
    .then(function(thread) { reply(thread); })
    .catch(function(err) {
      request.log('error', 'Import board: ' + JSON.stringify(err, ['stack', 'message'], 2));
      reply(Boom.badImplementation(err));
    });
  }
};

exports.byBoard = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: {
    params: threadValidator.paramsByBoard,
    query: threadValidator.queryByBoard
  },
  pre: [
    { method: pre.getThreads, assign: 'threads' },
    { method: pre.getUserThreadViews, assign: 'threadViews' }
  ],
  handler: function(request, reply) {
    var threads = request.pre.threads;
    var threadViews = request.pre.threadViews;
    var user = request.auth.credentials;

    // iterate through threads and see if the thread has been viewed yet
    if (threadViews) {
      threads = threads.map(function(thread) {
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
      });
    }

    return reply(threads);
  }
};

exports.find = {
  auth: { mode: 'try', strategy: 'jwt' },
  pre: [
    [
      { method: pre.getThread, assign: 'thread' },
      { method: pre.checkViewValidity, assign: 'newViewId' },
      { method: pre.updateUserThreadViews }
    ]
  ],
  handler: function(request, reply) {
    var thread = request.pre.thread;
    var newViewerId = request.pre.newViewId;
    if (newViewerId) { return reply(thread).header('Epoch-Viewer', newViewerId); }
    else { return reply(thread); }
  }
};
