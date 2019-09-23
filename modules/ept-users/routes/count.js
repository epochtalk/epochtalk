var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {GET} /admin/users/count (Admin) Count Users
  * @apiName CountUsersAdmin
  * @apiPermission Super Administrator, Administrator
  * @apiDescription This allows Administrators to get a count of how many users are registered.
  * This is used in the admin panel for paginating through users.
  *
  * @apiParam (Query) {string="banned"} [filter] If banned is passed in, route will return count
  * of banned users.
  * @apiParam (Query) {string} [search] Used to filter count by search string
  * @apiParam (Query) {boolean} [ip] Boolean indicating that search string is an ip address
  *
  * @apiSuccess {number} count The number of users registered given the passed in parameters
  *
  * @apiError (Error 500) InternalServerError There was an error calculating the user count
  */
module.exports = {
  method: 'GET',
  path: '/api/users/count',
  options: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        filter: Joi.string().valid('banned'),
        search: Joi.string(),
        ip: Joi.boolean()
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.users.page(request.server, request.auth) } ]
  },
  handler: function(request) {
    var opts;
    var filter = request.query.filter;
    var search = request.query.search;
    var ip = request.query.ip;
    if (filter || search) {
      opts = {
        filter: filter,
        searchStr: search,
        ip: ip
      };
    }

    var promise = request.db.users.count(opts)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
