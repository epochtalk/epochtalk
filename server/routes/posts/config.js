var Joi = require('joi');
var path = require('path');
var Hapi = require('hapi');
var Boom = require('boom');
var pre = require(path.normalize(__dirname + '/pre'));
var db = require(path.normalize(__dirname + '/../../../db'));

exports.create = {
  auth: { strategy: 'jwt' },
  validate: {
    payload: Joi.object().keys({
      title: Joi.string().min(1).max(255).required(),
      body: Joi.string().allow(''),
      raw_body: Joi.string().required(),
      thread_id: Joi.alternatives().try(Joi.string(), Joi.number()).required()
    })
  },
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
  // validate: {
  //   payload: Joi.object().keys({
  //     title: Joi.string().min(1).max(255).required(),
  //     body: Joi.string().allow(''),
  //     raw_body: Joi.string().required(),
  //     thread_id: Joi.alternatives().try(Joi.string(), Joi.number()).required()
  //   })
  // },
  pre: [
    { method: pre.clean },
    { method: pre.adjustQuoteDate },
    { method: pre.parseEncodings }
    // { method: pre.subImages }
  ],
  handler: function(request, reply) {
    // build the post object from payload and params
    db.posts.import(request.payload)
    .then(function(post) {
      reply(post);
    })
    .catch(function(err) {
      request.log('error', 'Import post: ' + JSON.stringify(err, ['stack', 'message'], 2));
      return reply(Boom.badRequest('Import post failed'));
    });
  }
};

exports.find = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: {
    params: {
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required()
    }
  },
  handler: function(request, reply) {
    if (!request.server.methods.viewable(request)) { return reply({}); }
    var id = request.params.id;
    db.posts.find(id)
    .then(function(post) { reply(post); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

exports.byThread = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: {
    query: {
      thread_id: Joi.string().required(),
      page: Joi.number().integer().default(1),
      limit: [ Joi.number().integer().min(1), Joi.string().valid('all') ]
    }
  },
  handler: function(request, reply) {
    if (!request.server.methods.viewable(request)) { return reply([]); }
    var user;
    if (request.auth.isAuthenticated) { user = request.auth.credentials; }
    var threadId = request.query.thread_id;
    var opts = {
      limit: request.query.limit || 10,
      page: request.query.page
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
    payload: {
      title: Joi.string().min(1).max(255).required(),
      body: Joi.string().allow(''),
      raw_body: Joi.string().required(),
      thread_id: Joi.alternatives().try(Joi.string(), Joi.number()).required()
    },
    params: {
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required()
    }
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
  validate: {
    params: {
      id: Joi.alternatives().try(Joi.string(), Joi.number()).required()
    }
  },
  pre: [ { method: pre.authPost } ],
  handler: function(request, reply) {
    var postId = request.params.id;
    db.posts.delete(postId)
    .then(function(post) { reply(post); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  },
};
