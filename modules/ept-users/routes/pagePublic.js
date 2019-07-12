var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {GET} /search/users Page Users
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
  * @apiSuccess {string} field The field the results are sorted by
  * @apiSuccess {boolean} desc The order the results are sorted in
  * @apiSuccess {number} page The current page of the results
  * @apiSuccess {number} page_count Total number of pages in results
  * @apiSuccess {string} search The search term used in query
  * @apiSuccess {number} limit The number of results returned per page
  * @apiSuccess {number} count The total number of results
  * @apiSuccess {object[]} users An array of user objects
  * @apiSuccess {string} users.id The unique id of the user
  * @apiSuccess {string} users.username The username of the user
  * @apiSuccess {string} users.role The role of the user
  * @apiSuccess {timestamp} users.created_at Timestamp of when the user was created
  * @apiSuccess {timestamp} users.post_count The number of posts this user has made
  * @apiSuccess {timestamp} users.avatar The user's avatar
  *
  * @apiError (Error 500) InternalServerError There was an error retrieving the users
  */
module.exports = {
  method: 'GET',
  path: '/api/search/users',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(25),
        field: Joi.string().default('username').valid('username', 'role', 'created_at', 'post_count'),
        desc: Joi.boolean().default(false),
        search: Joi.string()
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.users.pagePublic(request.server, request.auth) } ],
  },
  handler: function(request, reply) {
    var opts = {
      limit: request.query.limit,
      page: request.query.page,
      sortField: request.query.field,
      desc: request.query.desc,
      searchStr: request.query.search
    };
    var promise = request.db.users.pagePublic(opts)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
