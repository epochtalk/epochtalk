var Joi = require('joi');
var path = require('path');
var Promise = require('bluebird');
var querystring = require('querystring');
var common = require(path.normalize(__dirname + '/../common'));

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {GET} /posts/user/:username Page By User
  * @apiName PagePostsByUser
  * @apiDescription Used to page through posts made by a particular user
  *
  * @apiParam {string} username The username of the user's whose posts to page through
  *
  * @apiParam (Query) {number{1..n}} [page=1] Which page of the user's posts to retrieve
  * @apiParam (Query) {number{1..100}} [limit=25] How many posts to return per page
  * @apiParam (Query) {boolean} [desc=true] True to sort descending, false to sort ascending
  *
  * @apiSuccess {number} page The page of posts to return
  * @apiSuccess {number} limit The number of posts to return per page
  * @apiSuccess {boolean} desc Boolean indicating the sort order of the posts
  * @apiSuccess {object[]} posts Object containing users posts
  * @apiSuccess {string} posts.id The id of the post
  * @apiSuccess {string} posts.thread_id The id of the thread containing the post
  * @apiSuccess {string} posts.body The unprocessed body of the post
  * @apiSuccess {string} posts.body_html The processed body of the post
  * @apiSuccess {number} posts.position The position of the post in the thread
  * @apiSuccess {boolean} posts.deleted Boolean indicating if the post is deleted
  * @apiSuccess {boolean} posts.hidden Boolean indicating if the post is hidden (true if user is owner of deleted post)
  * @apiSuccess {timestamp} posts.created_at The created at timestamp of the post
  * @apiSuccess {timestamp} posts.updated_at The updated at timestamp of the post
  * @apiSuccess {timestamp} posts.imported_at The imported at timestamp of the post
  * @apiSuccess {string} posts.board_id The id of the board containing the post
  * @apiSuccess {string} posts.thread_title The title of the thread the post is in
  * @apiSuccess {string} posts.avatar The avatar of the user who made the post
  * @apiSuccess {object} posts.user Object containing user data about the author of the post
  * @apiSuccess {string} posts.user.id The id of the user
  *
  * @apiError (Error 500) InternalServerError There was an issue paging posts for user
  */
module.exports = {
  method: 'GET',
  path: '/api/posts/user/{username}',
  config: {
    app: { hook: 'posts.pageByUser' },
    auth: { mode: 'try', strategy: 'jwt' },
    validate: {
      params: { username: Joi.string().required() },
      query: {
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(25),
        desc: Joi.boolean().default(true)
      }
    },
    pre: [
      { method: (request) => request.server.methods.auth.posts.pageByUser(request.server, request.auth, request.params.username), assign: 'auth' },
      { method: (request) => request.server.methods.hooks.preProcessing },
      [
        { method: (request) => request.server.methods.hooks.parallelProcessing, assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: (request) => request.server.methods.hooks.merge },
      { method: 'common.posts.parseOut(request.parser, request.pre.processed.posts)' },
      { method: (request) => request.server.methods.hooks.postProcessing }
    ],
    handler: function(request, reply) {
      return reply(request.pre.processed);
    }
  }
};

function processing(request, reply) {
  var userId = '';
  var authenticated = request.auth.isAuthenticated;
  if (authenticated) { userId = request.auth.credentials.id; }
  var viewables = request.pre.auth.viewables;
  var priority = request.pre.auth.priority;
  var username = querystring.unescape(request.params.username);
  var opts = {
    limit: request.query.limit,
    page: request.query.page,
    desc: request.query.desc
  };

  var getPosts = request.db.posts.pageByUser(username, priority, opts);
  var getCount = request.db.posts.pageByUserCount(username);

  // get user's posts
  var promise = Promise.join(getPosts, getCount, function(posts, count) {
    return {
      page: opts.page,
      limit: opts.limit,
      desc: opts.desc,
      posts: common.cleanPosts(posts, userId, viewables, request),
      count: count
    };
  })
  .error(request.errorMap.toHttpError);

  return promise;
}
