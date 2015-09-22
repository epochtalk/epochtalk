var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var pre = require(path.normalize(__dirname + '/pre'));
var db = require(path.normalize(__dirname + '/../../../db'));
var imageStore = require(path.normalize(__dirname + '/../../images'));
var querystring = require('querystring');

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
  app: { thread_id: 'payload.thread_id' },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'posts.create' },
  validate: {
    payload: Joi.object().keys({
      title: Joi.string().min(1).max(255).required(),
      body: Joi.string().allow(''),
      raw_body: Joi.string().required(),
      thread_id: Joi.string().required()
    })
  },
  pre: [
    [
      { method: pre.accessPrivateBoardWithThreadId },
      { method: pre.accessBoardWithThreadId },
      { method: pre.accessLockedThreadWithThreadId },
      { method: pre.isRequesterActive }
    ],
    { method: pre.clean },
    { method: pre.parseEncodings },
    { method: pre.subImages }
  ],
  handler: function(request, reply) {
    // build the post object from payload and params
    var newPost = request.payload;
    newPost.user_id = request.auth.credentials.id;

    // create the post in db
    var promise = db.posts.create(newPost)
    .then(createImageReferences); // handle image references
    return reply(promise);
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
    var promise = db.posts.import(request.payload)
    // TODO: handle image references
    .catch(function(err) {
      request.log('error', 'Import post: ' + JSON.stringify(err, ['stack', 'message'], 2));
      return Boom.badRequest('Import post failed');
    });
    return reply(promise);
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
  app: { post_id: 'params.id' },
  auth: { mode: 'try', strategy: 'jwt' },
  plugins: { acls: 'posts.find' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ [
    { method: pre.accessPrivateBoardWithPostId },
    { method: pre.accessBoardWithPostId },
    { method: pre.canViewDeletedPost, assign: 'viewDeleted' }
  ] ],
  handler: function(request, reply) {
    // retrieve post
    var userId = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { userId = request.auth.credentials.id; }
    var viewDeleted = request.pre.viewDeleted;
    var id = request.params.id;
    var promise = db.posts.find(id)
    .then(function(post) { return cleanPosts(post, userId, viewDeleted); })
    .then(function(posts) { return posts[0]; })
    .error(function(err) { return Boom.badRequest(err.message); });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Posts
  * @api {GET} /posts Page By Thread
  * @apiName PagePostsByThread
  * @apiDescription Used to page through posts by thread.
  *
  * @apiParam (Query) {string} thread_id Id of the thread to retrieve posts from
  * @apiParam (Query) {number} page Specific page of posts to retrieve. Do not use with start.
  * @apiParam (Query) {mixed} limit Number of posts to retrieve per page.
  * @apiParam (Query) {number} start Specific post within the thread. Do not use with page.
  *
  * @apiSuccess {array} posts Object containing posts for particular page, the thread these Posts
  * belong to, and the calculated page and limit constraints.
  *
  * @apiError (Error 500) InternalServerError There was an issue finding the posts for thread
  */
exports.byThread = {
  app: { thread_id: 'query.thread_id'},
  auth: { mode: 'try', strategy: 'jwt' },
  plugins: { acls: 'posts.byThread' },
  validate: {
    query: Joi.object().keys({
      thread_id: Joi.string().required(),
      start: Joi.number().integer().min(1),
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1).max(100).default(25)
    }).without('start', 'page')
  },
  // TODO: Highlight deleted post and to show mods
  pre: [ [
    { method: pre.accessPrivateBoardWithThreadId },
    { method: pre.accessBoardWithThreadId }
  ] ],
  handler: function(request, reply) {
    // ready parameters
    var userId = '';
    var page = request.query.page;
    var start = request.query.start;
    var limit = request.query.limit;
    var threadId = request.query.thread_id;
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { userId = request.auth.credentials.id; }

    var opts = { limit: limit, start: 0, page: 1 };
    if (start) { opts.page = Math.ceil(start / limit); }
    else if (page) { opts.page = page; }
    opts.start = ((opts.page * limit) - limit);

    // retrieve posts for this thread
    var getPosts = db.posts.byThread(threadId, opts);
    var getThread = db.threads.find(threadId);

    // TODO: Show admin deleted posts but style them differently, see canFind method
    var promise = Promise.join(getPosts, getThread, function(posts, thread) {
      return {
        thread: thread,
        limit: opts.limit,
        page: opts.page,
        posts: cleanPosts(posts, userId)
      };
    })
    // handle page or start out of range
    .then(function(ret) {
      var retVal = Boom.notFound();
      if (ret.posts.length > 0) { retVal = ret; }
      return retVal;
    });

    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Posts
  * @api {POST} /posts/:id Update
  * @apiName UpdatePost
  * @apiPermission User (Post's Author) or Admin
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
  app: {
    thread_id: 'payload.thread_id',
    post_id: 'params.id',
    isPostOwner: 'posts.privilegedUpdate',
    isPostWriteable: 'posts.privilegedUpdate'
  },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'posts.update' },
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
    [
      { method: pre.isPostOwner },
      { method: pre.isPostWriteable },
      { method: pre.accessPrivateBoardWithThreadId },
      { method: pre.accessBoardWithThreadId },
      { method: pre.accessLockedThreadWithThreadId },
      { method: pre.isRequesterActive }
    ],
    { method: pre.clean },
    { method: pre.parseEncodings },
    { method: pre.subImages }
  ],
  handler: function(request, reply) {
    var updatePost = request.payload;
    updatePost.id = request.params.id;
    var promise = db.posts.update(updatePost)
    .then(updateImageReferences); // handle image references
    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Posts
  * @api {DELETE} /posts/:id Delete
  * @apiName DeletePost
  * @apiPermission User (Post's Author) or Admin
  * @apiDescription Used to delete a post.
  *
  * @apiParam {string} id The Id of the post to delete
  *
  * @apiUse PostObjectSuccess
  *
  * @apiError (Error 400) BadRequest Post Already Deleted
  * @apiError (Error 500) InternalServerError There was an issue deleting the post
  */
exports.delete = {
  app: {
    post_id: 'params.id',
    isPostOwner: 'posts.privilegedDelete'
  },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'posts.delete' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ [
    { method: pre.isCDRPost },
    { method: pre.isPostOwner },
    { method: pre.accessPrivateBoardWithPostId },
    { method: pre.accessBoardWithPostId },
    { method: pre.accessLockedThreadWithPostId },
    { method: pre.isRequesterActive }
  ] ], //handle permissions
  handler: function(request, reply) {
    var promise = db.posts.delete(request.params.id)
    .error(function(err) { return Boom.badRequest(err.message); });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Posts
  * @api {POST} /posts/:id Undelete
  * @apiName UndeletePost
  * @apiPermission User (Post's Author) or Admin
  * @apiDescription Used to undo a deleted post.
  *
  * @apiParam {string} id The Id of the post to undo deletion on
  *
  * @apiUse PostObjectSuccess
  *
  * @apiError (Error 400) BadRequest Post Not Deleted
  * @apiError (Error 500) InternalServerError There was an issue undeleting the post
  */
exports.undelete = {
  app: {
    post_id: 'params.id',
    isPostOwner: 'posts.privilegedDelete'
  },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'posts.undelete' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ [
    { method: pre.isCDRPost },
    { method: pre.isPostOwner },
    { method: pre.accessPrivateBoardWithPostId },
    { method: pre.accessBoardWithPostId },
    { method: pre.accessLockedThreadWithPostId },
    { method: pre.isRequesterActive }
  ] ], //handle permissions
  handler: function(request, reply) {
    var promise = db.posts.undelete(request.params.id)
    .error(function(err) { return Boom.badRequest(err.message); });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Posts
  * @api {DELETE} /posts/:id/purge Purge
  * @apiName PurgePost
  * @apiPermission Admin
  * @apiDescription Used to purge a post.
  *
  * @apiParam {string} id The Id of the post to purge
  *
  * @apiUse PostObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue purging the post
  */
exports.purge = {
  app: { post_id: 'params.id' },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'posts.purge' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: pre.isCDRPost } ], //handle permissions
  handler: function(request, reply) {
    var promise = db.posts.purge(request.params.id);
    return reply(promise);
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
  * @apiParam (Query) {number} limit=25 How many posts to return per page
  * @apiParam (Query) {string="created_at","updated_at","title"} field The field to sort the posts by
  * @apiParam (Query) {boolean} desc=false True to sort descending, false to sort ascending
  *
  * @apiSuccess {array} posts Array containing posts for a particular user
  *
  * @apiError (Error 500) InternalServerError There was an issue finding posts for the user
  */
exports.pageByUser = {
  auth: { mode: 'try', strategy: 'jwt' },
  plugins: { acls: 'posts.pageByUser' },
  validate: {
    params: { username: Joi.string().required() },
    query: {
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(25),
      field: Joi.string().default('created_at').valid('thread_title', 'created_at', 'updated_at', 'title'),
      desc: Joi.boolean().default(false)
    }
  },
  pre: [ [
    { method: pre.accessUser },
    { method: pre.canViewDeletedPost, assign: 'viewDeleted' }
  ] ],
  handler: function(request, reply) {
    // TODO: canViewDeletePost only works for admins/globalMods
    // pull the board_id, to check if user can view this post.
    // this will include pulling the user's mod board list to compare against.
    // this will probably end up being a new pre method entirely
    // TODO: this still shows posts from deleted threads/boards
    // check if each board_id from each post is in the board mapping
    // if it's not, then flag the post deleted.
    // This may require another pre method to either pull public board ids or
    // updating the db query to check if the board is deleted.

    // ready parameters
    var userId = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { userId = request.auth.credentials.id; }
    var viewDeleted = request.pre.viewDeleted;
    var username = querystring.unescape(request.params.username);
    var opts = {
      limit: request.query.limit,
      page: request.query.page,
      sortField: request.query.field,
      sortDesc: request.query.desc
    };

    var getPosts = db.posts.pageByUser(username, opts);
    var getCount = db.posts.pageByUserCount(username);

    // get user's posts
    var promise = Promise.join(getPosts, getCount, function(posts, count) {
      return {
        page: opts.page,
        limit: opts.limit,
        sortField: opts.sortField,
        sortDesc: opts.sortDesc,
        posts: cleanPosts(posts, userId, viewDeleted),
        count: count
      };
    });

    return reply(promise);
  }
};

function cleanPosts(posts, currentUserId, viewDeleted) {
  posts = [].concat(posts);

  return posts.map(function(post) {
    // if currentUser owns post, show everything
    if (currentUserId === post.user.id) { return post; }
    if (viewDeleted) { return post; }

    // remove deleted users or post information
    if (post.deleted || post.user.deleted) {
      post.body = '';
      post.raw_body = '';

      delete post.avatar;
      delete post.created_at;
      delete post.updated_at;
      delete post.imported_at;
      delete post.user.signature;
      delete post.user.role;
      delete post.user.username;
      delete post.user.id;
    }

    return post;
  });
}

function createImageReferences(post) {
  // load html in post.body into cheerio
  var html = post.body;
  var $ = cheerio.load(html);

  // collect all the images in the body
  var images = [];
  $('img').each(function(index, element) {
    images.push(element);
  });

  // save all images with a reference to post
  images.map(function(element) {
    var imgSrc = $(element).attr('src');
    imageStore.addPostImageReference(post.id, imgSrc);
  });

  return post;
}

function updateImageReferences(post) {
  // load html in post.body into cheerio
  var html = post.body;
  var $ = cheerio.load(html);

  // collect all the images in the body
  var images = [];
  $('img').each(function(index, element) {
    images.push(element);
  });

  // delete all image references for this post
  imageStore.removePostImageReferences(post.id)
  .then(function() {
    // convert each image's src to cdn version
    images.map(function(element) {
      var imgSrc = $(element).attr('src');
      imageStore.addPostImageReference(post.id, imgSrc);
    });
  });

  return post;
}

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
