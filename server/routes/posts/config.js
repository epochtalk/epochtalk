var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var cheerio = require('cheerio');
var pre = require(path.normalize(__dirname + '/pre'));
var db = require(path.normalize(__dirname + '/../../../db'));
var imageStore = require(path.normalize(__dirname + '/../../images'));

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
    { method: pre.canCreate }, //handle permissions
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
  auth: { mode: 'try', strategy: 'jwt' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: pre.canFind } ],
  handler: function(request, reply) {
    // handle permissions
    if (!request.server.methods.viewable(request)) { return reply({}); }

    // retrieve post
    var authenticated = request.auth.isAuthenticated;
    var id = request.params.id;
    var promise = db.posts.find(id)
    .then(function(post) { return cleanPosts(post, userId); })
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
      limit: [
        Joi.number().integer().min(1).max(100),
        Joi.string().valid('all')
      ]
    }
  },
  pre: [ { method: pre.canRetrieve } ],
  handler: function(request, reply) {
    // handle permissions
    if (!request.server.methods.viewable(request)) { return reply([]); }

    // ready parameters
    var userId = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { userId = request.auth.credentials.id; }
    var threadId = request.query.thread_id;
    var opts = {
      limit: request.query.limit || 10,
      page: request.query.page
    };

    // retrieve posts for this thread
    var promise;
    if (opts.limit === 'all') {
      promise = db.threads.find(threadId)
      .then(function(thread) {
        opts.limit = Number(thread.post_count) || 10;
        return [threadId, opts];
      })
      .spread(db.posts.byThread)
      .then(function(posts) { return cleanPosts(posts, userId); });
    }
    else {
      promise = db.posts.byThread(threadId, opts)
      .then(function(posts) { return cleanPosts(posts, userId); });
    }

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
    { method: pre.canUpdate }, //handle permissions
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
  auth: { strategy: 'jwt' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: pre.canDelete } ], //handle permissions
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
  auth: { strategy: 'jwt' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: pre.canDelete }, ], //handle permissions
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
  auth: { strategy: 'jwt' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: pre.canPurge } ], //handle permissions
  handler: function(request, reply) {
    var promise = db.posts.purge(request.params.id);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.3.0
  * @apiGroup Posts
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
  pre: [ { method: pre.canPageByUserCount } ],
  // TODO: this still shows posts from deleted threads/boards
  handler: function(request, reply) {
    // handle permissions
    if (!request.server.methods.viewable(request)) { return reply([]); }

    // retrieve post count for user
    var username = request.params.username;
    return reply(db.posts.pageByUserCount(username));
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
  pre: [ [
    { method: pre.canPageByUser },
    { method: pre.isAdmin, assign: 'isAdmin' }
  ] ],
  handler: function(request, reply) {
  // TODO: this still shows posts from deleted threads/boards
    // handle permissions
    if (!request.server.methods.viewable(request)) { return reply([]); }

    // ready parameters
    var userId = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { userId = request.auth.credentials.id; }
    var isAdmin = request.pre.isAdmin;
    var username = request.params.username;
    var opts = {
      limit: request.query.limit,
      page: request.query.page,
      sortField: request.query.field,
      sortDesc: request.query.desc
    };

    // get user's posts
    var promise = db.posts.pageByUser(username, opts)
    .then(function(posts) { return cleanPosts(posts, userId, isAdmin); });

    return reply(promise);
  }
};

function cleanPosts(posts, currentUserId, isAdmin) {
  posts = [].concat(posts);

  return posts.map(function(post) {
    // if currentUser owns post, show everything
    if (currentUserId === post.user.id) { return post; }
    if (isAdmin) { return post; }

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
