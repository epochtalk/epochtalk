var path = require('path');
var uuid = require('node-uuid');
var Hapi = require('hapi');
var Promise = require('bluebird');
var core = require('epochcore')();
var threadSchema = require(path.join('..', 'schema', 'threads'));
var pre = require(path.join('..', 'pre', 'threads'));
var memDb = require(path.join('..', '..', '..', 'memStore')).db;

exports.create = {
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
    .catch(function(err) { reply(err.message); });
  },
  validate: { payload: threadSchema.validate },
  auth: { strategy: 'jwt' }
};

exports.byBoard = {
  pre: [
    { method: pre.getThreads, assign: 'threads' },
    { method: pre.getUserViews, assign: 'userViews' }
  ],
  handler: function(request, reply) {
    var threads = request.pre.threads;
    var userViews = request.pre.userViews;

    // iterate through threads and see if the thread has been viewed yet
    if (userViews) {
      threads = threads.map(function(thread) {
        if (!userViews[thread.id]) {
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
  },
  validate: {
    params: threadSchema.validateByBoard,
    query: threadSchema.validateByBoard
  },
  auth: {
    mode: 'try',
    strategy: 'jwt'
  }
};

exports.find = {
  pre: [
    [
      { method: pre.getThread, assign: 'thread' },
      { method: pre.checkViewValidity, assign: 'newViewId' },
      { method: pre.updateUserView, assign: 'userView' }
    ]
  ],
  handler: function(request, reply) {
    var thread = request.pre.thread;
    var newViewerId = request.pre.newViewId;
    if (newViewerId) { return reply(thread).header('Epoch-Viewer', newViewerId); }
    else { return reply(thread); }
  },
  auth: { mode: 'try', strategy: 'jwt' }
};
