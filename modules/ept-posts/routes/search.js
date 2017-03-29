var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {GET} /search/users (Admin) Page Users
  * @apiName PageUsersPublic
  * @apiPermission User
  * @apiDescription This allows users to page through all registered users.
  *
  * @apiParam (Query) {number{1..n}} [page=1] The page of registered users to retrieve
  * @apiParam (Query) {number{1..n}} [limit=25] The number of users to retrieve per page
  * @apiParam (Query) {string="username","role","created_at","post_count"} [field=username] The db field to sort the results by
  * @apiParam (Query) {boolean} [desc=false] Boolean indicating whether or not to sort the results
  * in descending order
  * @apiParam (Query) {string} [search] Username to search for
  *
  * @apiSuccess {object} pageData An object containing users and query options
  * @apiSuccess {string} pageData.field The field the results are sorted by
  * @apiSuccess {string} pageData.desc The order the results are sorted in
  * @apiSuccess {string} pageData.page The current page of the results
  * @apiSuccess {string} pageData.page_count Total number of pages in results
  * @apiSuccess {string} pageData.search The search term used in query
  * @apiSuccess {string} pageData.limit The number of results returned per page
  * @apiSuccess {string} pageData.count The total number of results
  * @apiSuccess {object[]} pageData.users An array of user objects
  * @apiSuccess {string} pageData.users.id The unique id of the user
  * @apiSuccess {string} pageData.users.username The username of the user
  * @apiSuccess {string} pageData.users.role The role of the user
  * @apiSuccess {timestamp} pageData.users.created_at Timestamp of when the user was created
  * @apiSuccess {timestamp} pageData.users.post_count The number of posts this user has made
  * @apiSuccess {timestamp} pageData.users.avatar The user's avatar
  *
  * @apiError (Error 500) InternalServerError There was error retrieving the users
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
  var promise = request.db.posts.search(opts, userPriority);
  return reply(promise);
}
