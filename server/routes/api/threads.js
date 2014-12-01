var core = require('epochcore')();
var Hapi = require('hapi');
var uuid = require('node-uuid');
var threadValidator = require('epoch-validator').api.threads;
var path = require('path');
var memDb = require(path.join('..', '..', 'memStore')).db;
var postPre = require(path.join(__dirname, 'posts')).pre;

// Helpers
var checkViewKey = function(key) {
  return memDb.getAsync(key)
  .then(function(storedTime) {
    var timeElapsed = Date.now() - storedTime;
    // key exists and is past the cooling period
    // update key with new value and return true
    if (timeElapsed > 1000 * 60) {
      return memDb.putAsync(key, Date.now())
      .then(function() { return true; });
    }
    // key exists but before cooling period
    // do nothing and return false
    else { return false; }
  });
};

// Pre
var pre = {
  getThreads: function(request, reply) {
    var boardId = request.query.board_id || request.params.board_id;
    var opts = {
      limit: request.query.limit || request.params.limit,
      page: request.query.page || request.params.page
    };

    core.threads.byBoard(boardId, opts)
    .then(function(threads) { return reply(threads); })
    .catch(function(err) { return reply(err.message); });
  },
  getThread: function(request, reply) {
    var threadId = request.params.id || request.query.id;
    core.threads.find(threadId)
    .then(function(thread) { return reply(thread); })
    .catch(function(err) { return reply(err); });
  },
  checkViewValidity: function(request, reply) {
    var threadId = request.params.id || request.query.id;
    var viewerId = request.headers['epoch-viewer'];
    var viewerAddress = request.info.remoteAddress;
    var newViewerId;

    if (viewerId) { // viewerId was sent back so try that
      var viewerIdKey = viewerId + threadId;
      return checkViewKey(viewerIdKey)
      .then(function(valid) { // viewId found
        if (valid) { core.threads.incViewCount(threadId); }
        return reply(undefined);
      })
      .catch(function() { // viewId not found
        memDb.putAsync(viewerIdKey, Date.now()); // save to memdb
        var addressKey = viewerAddress + threadId;
        return checkViewKey(addressKey)
        .then(function(valid) { // address found
          if (valid) { core.threads.incViewCount(threadId); }
          return reply(undefined);
        })
        // address doesn't exists so inc is valid
        .catch(function() {
          memDb.putAsync(addressKey, Date.now());
          core.threads.incViewCount(threadId);
          return reply(undefined);
        });
      });
    } // no viewerId, check IP
    else {
      newViewerId = uuid.v4(); // generate new viewerId
      memDb.putAsync(newViewerId + threadId, Date.now()); // save to mem db
      var addressKey = viewerAddress + threadId;
      return checkViewKey(addressKey)
      .then(function(valid) {
        if (valid) { core.threads.incViewCount(threadId); }
        return reply(newViewerId);
      })
      // address doesn't exists so inc is valid
      .catch(function() {
        memDb.putAsync(addressKey, Date.now());
        core.threads.incViewCount(threadId);
        return reply(newViewerId);
      });
    }
  },
  getUserViews: function(request, reply) {
    // return early if not signed in
    if (!request.auth.isAuthenticated) { return reply(undefined); }

    var user = request.auth.credentials;
    core.users.getUserViews(user.id)
    .then(function(userViews) { return reply(userViews); })
    .catch(function() { return reply({}); });
  },
  updateUserView: function(request, reply) {
    // return early if not signed in
    if (!request.auth.isAuthenticated) { return reply(); }

    var threadId = request.params.id || request.query.id;
    var now = Date.now();
    var user = request.auth.credentials;
    var newUserViews = [ { threadId: threadId, timestamp: now } ];
    core.users.putUserViews(user.id, newUserViews)
    .then(function() { return reply(); })
    .catch(function(err) { return reply(err); });
  }
};

// Route handlers/configs
var threads = {};
threads.create = {
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

threads.import = {
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

threads.byBoard = {
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

threads.find = {
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

// Export Routes/Pre
exports.routes = [
  // CREATE THREAD
  { method: 'POST', path: '/threads', config: threads.create },
  // QUERY for threads under: board_id
  { method: 'GET', path: '/threads', config: threads.byBoard },
  // GET
  { method: 'GET', path: '/threads/{id}', config: threads.find },
  // DON'T UPDATE THREAD (update should be done in post)
  // DON'T DELETE THREAD (for now, should delete all posts?)
  // POST IMPORT
  { method: 'POST', path: '/threads/import', config: threads.import }
];

exports.pre = pre;
