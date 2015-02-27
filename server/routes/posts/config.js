var path = require('path');
var db = require(path.join(__dirname, '..', '..', '..', 'db'));
var Hapi = require('hapi');
var Boom = require('boom');
var postValidator = require('epochtalk-validator').api.posts;
var pre = require(path.join(__dirname, 'pre'));

// Route handlers/configs
exports.create = {
  auth: { strategy: 'jwt' },
  validate: { payload: postValidator.schema.create },
  pre: [
    { method: pre.clean },
    { method: pre.parseEncodings },
    { method: pre.subImages }
  ],
  handler: function(request, reply) {
    // build the post object from payload and params
    var user = request.auth.credentials;
    var newPost = {
      title: request.payload.title,
      body: request.payload.body,
      raw_body: request.payload.raw_body,
      thread_id: request.payload.thread_id,
      user_id: user.id
    };

    // create the post in db
    db.posts.create(newPost)
    .then(function(post) { reply(post); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.import = {
  // auth: { strategy: 'jwt' },
  pre: [
    { method: pre.clean },
    { method: pre.adjustQuoteDate },
    { method: pre.parseEncodings },
    { method: pre.subImages }
  ],
  // validate: { payload: postValidator.create },
  handler: function(request, reply) {
    // build the post object from payload and params
    db.posts.import(request.payload)
    .then(function(post) { reply(post); })
    .catch(function(err) {
      request.log('error', 'Import board: ' + JSON.stringify(err, ['stack', 'message'], 2));
      reply(Boom.badImplementation(err));
    });
  }
};

exports.find = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: { params: postValidator.schema.id },
  pre: [ { method: pre.requireLogin, assign: 'viewable' } ],
  handler: function(request, reply) {
    if (!request.pre.viewable) { return reply({}); }
    var id = request.params.id;
    db.posts.find(id)
    .then(function(post) { reply(post); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.byThread = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: {
    params: postValidator.paramsByThread,
    query: postValidator.queryByThread
  },
  pre: [ { method: pre.requireLogin, assign: 'viewable' } ],
  handler: function(request, reply) {
    if (!request.pre.viewable) { return reply([]); }
    var user;
    if (request.auth.isAuthenticated) { user = request.auth.credentials; }
    var threadId = request.query.thread_id || request.params.thread_id;
    var opts = {
      limit: request.query.limit || request.params.limit,
      page: request.query.page || request.params.page
    };

    var queryByThread = function() {
      db.posts.byThread(threadId, opts)
      .then(function(posts) {
        if (user) {
          posts.map(function(post) {
            if (post.user.id === user.id) { post.editable = true; }
          });
        }
        reply(posts);
      })
      .catch(function(err) { reply(Boom.badImplementation(err)); });
    };

    if (opts.limit === 'all') {
      db.threads.find(threadId)
      .then(function(thread) {
        opts.limit = Number(thread.post_count) || 10;
        queryByThread();
      });
    }
    else { queryByThread(); }
  }
};

exports.update = {
  auth: { strategy: 'jwt' },
  validate: {
    payload: postValidator.schema.update,
    params: postValidator.schema.id
  },
  pre: [
    { method: pre.authPost },
    { method: pre.clean },
    { method: pre.parseEncodings },
    { method: pre.subImages }
  ],
  handler: function(request, reply) {
    // build updatePost object from params and payload
    var updatePost = {
      id: request.params.id,
      title: request.payload.title,
      body: request.payload.body,
      raw_body: request.payload.raw_body,
      thread_id: request.payload.thread_id
    };

    db.posts.update(updatePost)
    .then(function(post) { reply(post); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.delete = {
  auth: { strategy: 'jwt' },
  validate: { params: postValidator.schema.id },
  pre: [ { method: pre.authPost } ],
  handler: function(request, reply) {
    var postId = request.params.id;
    db.posts.delete(postId)
    .then(function(post) { reply(post); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  },
};
