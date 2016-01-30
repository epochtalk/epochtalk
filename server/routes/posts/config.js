var _ = require('lodash');
var Joi = require('joi');
var Boom = require('boom');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var querystring = require('querystring');

/**
  * @apiVersion 0.4.0
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
    { method: 'auth.posts.create(server, auth, payload.thread_id)' },
    { method: 'common.posts.clean(sanitizer, payload)' },
    { method: 'common.posts.parse(payload)' },
    { method: 'common.images.sub(imageStore, payload)' }
  ],
  handler: function(request, reply) {
    // build the post object from payload and params
    var newPost = request.payload;
    newPost.user_id = request.auth.credentials.id;

    // create the post in db
    var promise = request.db.posts.create(newPost)
    // handle image references
    .then((post) => { return createImageReferences(request.imageStore, post); });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
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
  plugins: { acls: 'posts.find' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: 'auth.posts.find(server, auth, params.id)', assign: 'viewDeleted' } ],
  handler: function(request, reply) {
    // retrieve post
    var userId = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { userId = request.auth.credentials.id; }
    var viewDeleted = request.pre.viewDeleted;
    var id = request.params.id;
    var promise = request.db.posts.find(id)
    .then(function(post) { return cleanPosts(post, userId, viewDeleted); })
    .then(function(posts) { return posts[0]; })
    .error(function(err) { return Boom.badRequest(err.message); });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
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
  pre: [ { method: 'auth.posts.byThread(server, auth, query.thread_id)', assign: 'viewables' } ],
  handler: function(request, reply) {
    // ready parameters
    var userId = '';
    var page = request.query.page;
    var start = request.query.start;
    var limit = request.query.limit;
    var threadId = request.query.thread_id;
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { userId = request.auth.credentials.id; }
    var viewables = request.pre.viewables;

    var opts = { limit: limit, start: 0, page: 1 };
    if (start) { opts.page = Math.ceil(start / limit); }
    else if (page) { opts.page = page; }
    opts.start = ((opts.page * limit) - limit);

    // retrieve posts for this thread
    var getPosts = request.db.posts.byThread(threadId, opts);
    var getThread = request.db.threads.find(threadId);
    var getThreadWatching = request.db.threads.watching(threadId, userId);
    var getPoll = request.db.polls.byThread(threadId);
    var hasVoted = request.db.polls.hasVoted(threadId, userId);

    var promise = Promise.join(getPosts, getThread, getThreadWatching, getPoll, hasVoted, function(posts, thread, threadWatching, poll, voted) {
      // check if thread is being Watched
      if (threadWatching) { thread.watched = true; }
      if (poll) {
        var hideVotes = poll.display_mode === 'voted' && !voted;
        hideVotes = hideVotes || (poll.display_mode === 'expired' && poll.expiration > Date.now());
        if (hideVotes) { poll.answers.map(function(answer) { answer.votes = 0; }); }
        poll.hasVoted = voted;
        thread.poll = poll;
      }

      return {
        thread: thread,
        limit: opts.limit,
        page: opts.page,
        posts: cleanPosts(posts, userId, viewables)
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
  * @apiVersion 0.4.0
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
    { method: 'auth.posts.update(server, auth, params.id, payload.thread_id)' },
    { method: 'common.posts.clean(sanitizer, payload)' },
    { method: 'common.posts.parse(payload)' },
    { method: 'common.images.sub(imageStore, payload)' }
  ],
  handler: function(request, reply) {
    var updatePost = request.payload;
    updatePost.id = request.params.id;
    var promise = request.db.posts.update(updatePost)
    // handle image references
    .then((post) => { return updateImageReferences(request.imageStore, post); });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
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
  plugins: { acls: 'posts.delete' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: 'auth.posts.delete(server, auth, params.id)'} ],
  handler: function(request, reply) {
    var promise = request.db.posts.delete(request.params.id)
    .error(function(err) { return Boom.badRequest(err.message); });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
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
    mod_log: {
      type: 'posts.undelete',
      data: { id: 'params.id' }
    },
    post_id: 'params.id',
    isPostDeletable: 'posts.privilegedDelete'
  },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'posts.undelete' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: 'auth.posts.delete(server, auth, params.id)'} ],
  handler: function(request, reply) {
    var promise = request.db.posts.undelete(request.params.id)
    .error(function(err) { return Boom.badRequest(err.message); });
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
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
  app: {
    mod_log: {
      type: 'posts.purge',
      data: { id: 'params.id' }
    },
    post_id: 'params.id'
  },
  auth: { strategy: 'jwt' },
  plugins: { acls: 'posts.purge' },
  validate: { params: { id: Joi.string().required() } },
  pre: [ { method: 'auth.posts.purge(server, auth, params.id)' } ],
  handler: function(request, reply) {
    var promise = request.db.posts.purge(request.params.id);
    return reply(promise);
  }
};

/**
  * @apiVersion 0.4.0
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
  pre: [ { method: 'auth.posts.pageByUser(server, auth, params.username)', assign: 'auth' } ],
  handler: function(request, reply) {
    var userId = '';
    var authenticated = request.auth.isAuthenticated;
    if (authenticated) { userId = request.auth.credentials.id; }
    var viewables = request.pre.auth.viewables;
    var priority = request.pre.auth.priority;
    var username = querystring.unescape(request.params.username);
    var opts = {
      limit: request.query.limit,
      page: request.query.page,
      sortField: request.query.field,
      sortDesc: request.query.desc
    };

    var getPosts = request.db.posts.pageByUser(username, priority, opts);
    var getCount = request.db.posts.pageByUserCount(username);

    // get user's posts
    var promise = Promise.join(getPosts, getCount, function(posts, count) {
      return {
        page: opts.page,
        limit: opts.limit,
        sortField: opts.sortField,
        sortDesc: opts.sortDesc,
        posts: cleanPosts(posts, userId, viewables),
        count: count
      };
    });

    return reply(promise);
  }
};

/**
 *  ViewContext can be an array of boards or a boolean
 */
function cleanPosts(posts, currentUserId, viewContext) {
  posts = [].concat(posts);
  var viewables = viewContext;
  var viewablesType = 'boolean';
  var boards = [];
  if (_.isArray(viewContext)) {
    boards = viewContext.map(function(vd) { return vd.board_id; });
    viewablesType = 'array';
  }

  return posts.map(function(post) {

    // if currentUser owns post, show everything
    var viewable = false;
    if (currentUserId === post.user.id) { viewable = true; }
    // if viewables is an array, check if user is moderating this post
    else if (viewablesType === 'array' && _.includes(boards, post.board_id)) { viewable = true; }
    // if viewables is a true, view all posts
    else if (viewables) { viewable = true; }

    // remove deleted users or post information
    var deleted = false;
    if (post.deleted || post.user.deleted || post.board_visible === false) { deleted = true; }

    // format post
    if (viewable && deleted) { post.hidden = true; }
    else if (deleted) {
      post = {
        id: post.id,
        hidden: true,
        _deleted: true,
        thread_title: 'deleted',
        user: {}
      };
    }

    if (!post.deleted) { delete post.deleted; }
    delete post.board_visible;
    delete post.user.deleted;
    return post;
  });
}

function createImageReferences(imageStore, post) {
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

function updateImageReferences(imageStore, post) {
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
