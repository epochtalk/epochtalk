var core = require('epochcore')();
var Hapi = require('hapi');
var postValidator = require('epoch-validator').api.posts;
var path = require('path');
var pre = require(path.join('..', 'pre', 'posts'));

exports.create = {
  auth: { strategy: 'jwt' },
  pre: [
    { method: pre.clean },
    { method: pre.parseEncodings },
    { method: pre.subImages }
  ],
  validate: { payload: postValidator.schema.create },
  handler: function(request, reply) {
    // build the post object from payload and params
    var user = request.auth.credentials;
    var newPost = {
      title: request.payload.title,
      body: request.payload.body,
      encodedBody: request.payload.encodedBody,
      thread_id: request.payload.thread_id,
      user_id: user.id
    };

    // create the post in core
    core.posts.create(newPost)
    .then(function(post) { reply(post); })
    .catch(function(err) { reply(Hapi.error.internal()); });
  }
};

exports.import = {
  // auth: { strategy: 'jwt' },
  // pre: [
  //   { method: pre.clean },
  //   { method: pre.parseEncodings },
  //   { method: pre.subImages }
  // ],
  // validate: { payload: postValidator.create },
  handler: function(request, reply) {
    // build the post object from payload and params
    core.posts.import(request.payload)
    .then(function(post) { reply(post); })
    .catch(function(err) { reply(err); });
  }
};

exports.find = {
  handler: function(request, reply) {
    var id = request.params.id;
    core.posts.find(id)
    .then(function(post) { reply(post); })
    .catch(function(err) { reply(Hapi.error.internal()); });
  },
  validate: { params: postValidator.schema.id }
};

exports.byThread = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: {
    params: postValidator.paramsByThread,
    query: postValidator.queryByThread
  },
  handler: function(request, reply) {
    var user;
    if (request.auth.isAuthenticated) { user = request.auth.credentials; }
    var threadId = request.query.thread_id || request.params.thread_id;
    var opts = {
      limit: request.query.limit || request.params.limit,
      page: request.query.page || request.params.page
    };

    core.posts.byThread(threadId, opts)
    .then(function(posts) {
      if (user) {
        posts.map(function(post) {
          if (post.user.id === user.id) { post.editable = true; }
        });
      }

      reply(posts);
    })
    .catch(function(err) { reply(Hapi.error.internal()); });
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
      encodedBody: request.payload.encodedBody,
      thread_id: request.payload.thread_id
    };

    core.posts.update(updatePost)
    .then(function(post) { reply(post); })
    .catch(function(err) { reply(Hapi.error.internal()); });
  }
};

exports.delete = {
  validate: { params: postValidator.schema.id },
  pre: [ { method: pre.authPost } ],
  handler: function(request, reply) {
    var postId = request.params.id;
    core.posts.delete(postId)
    .then(function(post) { reply(post); })
    .catch(function(err) { reply(Hapi.error.internal()); });
  },
};
