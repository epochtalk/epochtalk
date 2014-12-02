var core = require('epochcore')();
var Hapi = require('hapi');
var threadValidator = require('epoch-validator').api.threads;
var path = require('path');
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
      encodedBody: request.payload.encodedBody,
      user_id: user.id
    };

    // create the thread and first post in core
    core.threads.create(newThread)
    .then(function(thread) { newPost.thread_id = thread.id; })
    .then(function() { return core.posts.create(newPost); })
    .then(function(post) { reply(post); })
    .catch(function() { reply(Hapi.error.internal()); });
  }
};

exports.import = {
  // auth: { strategy: 'jwt' },
  // validate: { payload: threadValidator.schema.import },
  handler: function(request, reply) {
    core.threads.import(request.payload)
    // .then(function(importedThread) {
    //   return Promise.each(posts, function(post) {
    //     post.thread_id = importedThread.id;
    //     return core.posts.import(post);
    //   });
    // })
    .then(function(thread) { reply(thread); })
    .catch(function(err) { reply(err); });
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
    { method: pre.getUserViews, assign: 'userViews' }
  ],
  handler: function(request, reply) {
    var threads = request.pre.threads;
    var userViews = request.pre.userViews;
    var user = request.auth.credentials;

    // iterate through threads and see if the thread has been viewed yet
    if (userViews) {
      threads = threads.map(function(thread) {
        // If user made last post consider thread viewed
        if (user.username === thread.last_post_username) {
          thread.has_new_post = false;
        }
        else if (!userViews[thread.id]) {
          thread.has_new_post = true;
        }
        else if (userViews[thread.id] &&
                 userViews[thread.id] <= thread.last_post_created_at) {
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
      { method: pre.updateUserView }
    ]
  ],
  handler: function(request, reply) {
    var thread = request.pre.thread;
    var newViewerId = request.pre.newViewId;
    if (newViewerId) { return reply(thread).header('Epoch-Viewer', newViewerId); }
    else { return reply(thread); }
  }
};
