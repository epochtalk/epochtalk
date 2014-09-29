var core = require('epochcore')();
var postSchema = require('../schema/posts');

exports.create = {
  handler: function(request, reply) {
    // check if already logged in with jwt
    var user;
    if (request.auth.isAuthenticated) {
      user = request.auth.credentials;
    }

    // build the post object from payload and params
    var newPost = {
      title: request.payload.title,
      body: request.payload.body,
      thread_id: request.payload.thread_id,
      user_id: user.id
    };

    // create the post in core
    core.posts.create(newPost)
    .then(function(post) { reply(post); })
    .catch(function(err) { reply(err.message); });
  },
  validate: { payload: postSchema.validate },
  auth: { strategy: 'jwt' }
};

exports.find = {
  handler: function(request, reply) {
    var id = request.params.id;
    core.posts.find(id)
    .then(function(post) { reply(post); })
    .catch(function(err) { reply(err.message); });
  },
  validate: { params: postSchema.validateId }
};

exports.byThread = {
  handler: function(request, reply) {
    var threadId = request.query.thread_id || request.params.thread_id;
    var opts = {
      limit: request.query.limit || request.params.limit,
      page: request.query.page || request.params.page
    };
    core.posts.byThread(threadId, opts)
    .then(function(posts) { reply(posts); })
    .catch(function(err) { reply(err.message); });
  },
  validate: {
    params: postSchema.validateByThread,
    query: postSchema.validateByThread
  }
};

exports.update = {
  handler: function(request, reply) {
    // build updatePost object from params and payload
    var updatePost = {
      id: request.params.id,
      title: request.payload.title,
      body: request.payload.body,
      thread_id: request.payload.thread_id
    };

    core.posts.update(updatePost)
    .then(function(post) { reply(post); })
    .catch(function(err) { reply(err.message); });
  },
  validate: {
    payload: postSchema.validate,
    params: postSchema.validateId
  }
};

exports.delete = {
  handler: function(request, reply) {
    var postId = request.params.id;
    core.posts.delete(postId)
    .then(function(post) { reply(post); })
    .catch(function(err) { reply(err.message); });
  },
  validate: { params: postSchema.validateId }
};
