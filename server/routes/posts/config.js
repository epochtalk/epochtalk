var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var pre = require(path.normalize(__dirname + '/pre'));
var db = require(path.normalize(__dirname + '/../../../db'));

/**
  * @apiVersion 0.3.0
  * @apiGroup Posts
  * @api {POST} /posts Create
  * @apiName CreatePost
  * @apiPermission User
  * @apiDescription Used to create a new post.
  *
  * @apiUse PostObjectPayload
  *
  * @apiUse PostObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue creating the post
  */
exports.create = {
  auth: { strategy: 'jwt' },
  validate: {
    payload: Joi.object().keys({
      title: Joi.string().min(1).max(255).required(),
      body: Joi.string().allow(''),
      raw_body: Joi.string().required(),
      thread_id: Joi.string().required()
    })
  },
  pre: [
    { method: pre.threadLocked },
    { method: pre.clean },
    { method: pre.parseEncodings },
    { method: pre.subImages }
  ],
  handler: function(request, reply) {
    // build the post object from payload and params
    var user = request.auth.credentials;
    var newPost = request.payload;
    newPost.user_id = user.id;

    // create the post in db
    return reply(db.posts.create(newPost));
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Posts
  * @api {POST} /posts/import Import
  * @apiName ImportPost
  * @apiPermission Super Administrator
  * @apiDescription Used to import a post. Currently only SMF is supported.
  *
  * @apiUse PostObjectPayload
  * @apiParam (Payload) {object} smf Object containing SMF metadata
  * @apiParam (Payload) {number} smf.ID_MEMBER Legacy smf user id
  * @apiParam (Payload) {number} smf.ID_TOPIC Legacy smf thread id
  * @apiParam (Payload) {number} smf.ID_MSG Legacy smf post id
  * @apiParam (Payload) {string} smf.posterName Legacy smf username
  *
  * @apiUse PostObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue importing the post
  */
exports.import = {
  // auth: { strategy: 'jwt' },
  // validate: {
  //   payload: Joi.object().keys({
  //     title: Joi.string().min(1).max(255).required(),
  //     body: Joi.string().allow(''),
  //     raw_body: Joi.string().required(),
  //     thread_id: Joi.string().required()
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
    .then(reply)
    .catch(function(err) {
      request.log('error', 'Import post: ' + JSON.stringify(err, ['stack', 'message'], 2));
      return reply(Boom.badRequest('Import post failed'));
    });
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Posts
  * @api {GET} /posts/:id Find
  * @apiName FindPost
  * @apiDescription Used to find a post.
  *
  * @apiParam {string} id The unique id of the post to retrieve
  *
  * @apiUse PostObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue finding the post
  */
exports.find = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: { params: { id: Joi.string().required() } },
  handler: function(request, reply) {
    if (!request.server.methods.viewable(request)) { return reply({}); }
    var id = request.params.id;
    db.posts.find(id)
    .then(function(post) { reply(post); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Posts
  * @api {GET} /posts Page By Thread
  * @apiName PagePostsByThread
  * @apiDescription Used to page through posts by thread.
  *
  * @apiParam (Query) {string} thread_id The unique id of the thread to retrieve posts from
  * @apiParam (Query) {number} page=1 Which page of posts to retrieve
  * @apiParam (Query) {mixed} limit Number indicating how many posts to retrieve per page.
  * Also accepts string 'all' to retrieve all posts
  *
  * @apiSuccess {array} posts Array containing posts for particular page and thread
  *
  * @apiError (Error 500) InternalServerError There was an issue finding the posts for thread
  */
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
      .then(reply)
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

/**
  * @apiVersion 0.3.0
  * @apiGroup Posts
  * @api {POST} /posts/:id Update
  * @apiName UpdatePost
  * @apiPermission User (Post's Author)
  * @apiDescription Used to update a post.
  *
  * @apiParam {string} id The unique id of the post being updated
  * @apiUse PostObjectPayload
  *
  * @apiUse PostObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue updating the post
  */
exports.update = {
  auth: { strategy: 'jwt' },
  validate: {
    payload: {
      title: Joi.string().min(1).max(255).required(),
      body: Joi.string().allow(''),
      raw_body: Joi.string().required(),
      thread_id: Joi.string().required()
    },
    params: { id: Joi.string().required() }
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

/**
  * @apiVersion 0.3.0
  * @apiGroup Posts
  * @api {DELETE} /posts/:id Delete
  * @apiName DeletePost
  * @apiPermission User (Post's Author)
  * @apiDescription Used to delete a post.
  *
  * @apiParam {string} id The unique id of the post being updated
  *
  * @apiUse PostObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue deleting the post
  */
exports.delete = {
  auth: { strategy: 'jwt' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: pre.authPost } ],
  handler: function(request, reply) {
    var postId = request.params.id;
    db.posts.delete(postId)
    .then(function(post) { reply(post); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  },
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Posts
  * @api {GET} /posts/user/:username/count User Post Count
  * @apiName PagePostsByUserCount
  * @apiDescription Retrieves the number of posts created by a particular user.
  *
  * @apiParam {string} username The username of the user's post count to retrieve
  *
  * @apiSuccess {number} count Number of posts created by this user
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the post count
  */
exports.pageByUserCount = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: { params: { username: Joi.string().required() } },
  handler: function(request, reply) {
    var username = request.params.username;
    db.posts.pageByUserCount(username)
    .then(function(count) { reply(count); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Posts
  * @api {GET} /posts/user/:username Page By User
  * @apiName PagePostsByUser
  * @apiDescription Used to page through posts made by a particular user
  *
  * @apiParam {string} username The username of the user's whose posts to page through
  *
  * @apiParam (Query) {number} page=1 Which page of the user's posts to retrieve
  * @apiParam (Query) {number} limit=10 How many posts to return per page
  * @apiParam (Query) {string="created_at","updated_at","title"} field The field to sort the posts by
  * @apiParam (Query) {boolean} desc=false True to sort descending, false to sort ascending
  *
  * @apiSuccess {array} posts Array containing posts for a particular user
  *
  * @apiError (Error 500) InternalServerError There was an issue finding posts for the user
  */
exports.pageByUser = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: {
    params: { username: Joi.string().required() },
    query: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).default(10),
      field: Joi.string().default('created_at').valid('thread_title', 'created_at', 'updated_at', 'title'),
      desc: Joi.boolean().default(false)
    }
  },
  handler: function(request, reply) {
    var username = request.params.username;
    var opts = {
      limit: request.query.limit,
      page: request.query.page,
      sortField: request.query.field,
      sortDesc: request.query.desc
    };
    db.posts.pageByUser(username, opts)
    .then(function(posts) { reply(posts); })
    .catch(function(err) { reply(Boom.badImplementation(err)); });
  }
};

/**
  * @apiDefine PostObjectPayload
  * @apiParam (Payload) {string} title The title of the post
  * @apiParam (Payload) {string} body The post's body with any markup tags converted and parsed into html elements
  * @apiParam (Payload) {string} raw_body The post's body as it was entered in the editor by the user
  * @apiParam (Payload) {string} thread_id The unique id of the thread the post belongs to
  */

/**
  * @apiDefine PostObjectSuccess
  * @apiSuccess {string} id The unique id of the post
  * @apiSuccess {string} thread_id The unique id of the thread the post belongs to
  * @apiSuccess {string} user_id The unique id of the user who created the post
  * @apiSuccess {string} title The title of the post
  * @apiSuccess {string} body The post's body with any markup tags converted and parsed into html elements
  * @apiSuccess {string} raw_body The post's body as it was entered in the editor by the user
  * @apiSuccess {timestamp} created_at Timestamp of when the post was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the post was updated
  * @apiSuccess {timestamp} imported_at Timestamp of when the post was imported
  */
