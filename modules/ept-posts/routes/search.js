var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {GET} /search/posts Search Posts
  * @apiName PostsSearch
  * @apiPermission User
  * @apiDescription This allows users to search forum posts.
  *
  * @apiParam (Query) {number{1..n}} [page=1] The page of search results to retrieve
  * @apiParam (Query) {number{1..100}} [limit=25] The number of search results per page
  * @apiParam (Query) {boolean} [desc=false] Boolean indicating whether or not to sort the results in descending order
  * @apiParam (Query) {string} [search] The term to search posts for
  *
  * @apiSuccess {number} limit The number of results returned per page
  * @apiSuccess {string} page The current page of the results
  * @apiSuccess {number} desc The order the results are sorted in
  * @apiSuccess {string} search The search term used in query for posts
  * @apiSuccess {number} next The number of the next page of search results
  * @apiSuccess {number} prev The number of the previous page of search results
  * @apiSuccess {object[]} posts An array of post objects
  * @apiSuccess {string} posts.id The unique id of the post
  * @apiSuccess {string} posts.thread_title The title of the thread the post belongs to
  * @apiSuccess {string} posts.user_id The id of the author of the post
  * @apiSuccess {timestamp} posts.created_at Timestamp of when the post was created
  * @apiSuccess {string} posts.thread_id The id of the thread the post belongs to
  * @apiSuccess {number} posts.position The position of the post within the thread
  * @apiSuccess {string} posts.body The body of the post
  * @apiSuccess {string} posts.board_id The id of the board the post belongs to
  * @apiSuccess {string} posts.board_name The name of the board the post belongs to
  * @apiSuccess {string} posts.user User object containing info about user who made post
  * @apiSuccess {string} posts.user.username Username of the user who made the post
  *
  * @apiError (Error 500) InternalServerError There was an error retrieving the users
  */
module.exports = {
  method: 'GET',
  path: '/api/search/posts',
  config: {
    app: { hook: 'posts.search' },
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(25),
        desc: Joi.boolean().default(false),
        search: Joi.string()
      }
    },
    pre: [
      { method: 'auth.posts.search(server, auth)' },
      { method: 'hooks.preProcessing' },
      [
        { method: 'hooks.parallelProcessing', assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: 'hooks.merge' },
      { method: 'hooks.postProcessing' }
    ]
  },
  handler: function(request, reply) {
    return reply(request.pre.processed);
  }
};

function processing(request, reply) {
  var opts = {
    limit: request.query.limit,
    page: request.query.page,
    desc: request.query.desc,
    search: request.query.search
  };
  var userPriority = request.server.plugins.acls.getUserPriority(request.auth);
  var promise = request.db.posts.search(opts, userPriority)
  .error(request.errorMap.toHttpError);

  return reply(promise);
}
