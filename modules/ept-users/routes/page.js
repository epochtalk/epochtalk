var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {GET} /admin/users (Admin) Page Users
  * @apiName PageUsersAdmin
  * @apiPermission Super Administrator, Administrator
  * @apiDescription This allows Administrators to page through all registered users.
  *
  * @apiParam (Query) {number{1..n}} [page=1] The page of registered users to retrieve
  * @apiParam (Query) {number{1..n}} [limit=25] The number of users to retrieve per page
  * @apiParam (Query) {string="username","email","updated_at","created_at","imported_at","ban_expiration"} [field=username] The db field to sort the results by
  * @apiParam (Query) {boolean} [desc=false] Boolean indicating whether or not to sort the results
  * in descending order
  * @apiParam (Query) {string="banned"} [filter] If banned is passed in only banned users are returned
  * @apiParam (Query) {string} [search] Username to search for
  * @apiParam (Query) {boolean} [ip] Boolean indicating that search string is an ip address
  *
  * @apiSuccess {object[]} users An array of user objects
  * @apiSuccess {string} users.id The unique id of the user
  * @apiSuccess {string} users.username The username of the user
  * @apiSuccess {string} users.email The email of the user
  * @apiSuccess {boolean} users.deleted Boolean indicating if the user's account is deleted
  * @apiSuccess {string[]} users.user_ips Array of user's known IP addresses
  * @apiSuccess {boolean} users.deleted Boolean indicating if the user's account is deleted
  * @apiSuccess {timestamp} users.last_active Timestamp of when the user's account was last active
  * @apiSuccess {timestamp} users.ban_expiration Timestamp of when the user's ban expires
  * @apiSuccess {timestamp} users.created_at Timestamp of when the user was created
  * @apiSuccess {timestamp} users.updated_at Timestamp of when the user was last updated
  * @apiSuccess {timestamp} users.imported_at Timestamp of when the user was imported, null if not imported
  *
  * @apiError (Error 500) InternalServerError There was an error retrieving the users
  */
module.exports = {
  method: 'GET',
  path: '/api/users',
  options: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(25),
        field: Joi.string().default('username').valid('username', 'email', 'updated_at', 'created_at', 'imported_at', 'ban_expiration'),
        desc: Joi.boolean().default(false),
        filter: Joi.string().valid('banned'),
        search: Joi.string(),
        ip: Joi.boolean()
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.users.page(request.server, request.auth) } ]
  },
  handler: function(request) {
    var opts = {
      limit: request.query.limit,
      page: request.query.page,
      sortField: request.query.field,
      desc: request.query.desc,
      filter: request.query.filter,
      searchStr: request.query.search,
      ip: request.query.ip
    };
    var promise = request.db.users.page(opts)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
