var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {GET} /admin/users/search (Admin) Search Usernames
  * @apiName SearchUsernamesAdmin
  * @apiPermission Super Administrator, Administrator
  * @apiDescription This allows Administrators to search usernames. This is used in the admin panel
  * to autocomplete usernames when trying to quickly find a user.
  *
  * @apiParam (Query) {string} username Username to search for, doesn't have to be a full username
  * @apiParam (Query) {number} [limit=15] The number of usernames to return while searching
  *
  * @apiSuccess {string[]} usernames An array containing usernames with accounts on the forum
  *
  * @apiError (Error 500) InternalServerError There was an error searching for usernames
  */
module.exports = {
  method: 'GET',
  path: '/api/users/search',
  options: {
    auth: { strategy: 'jwt' },
    validate: {
      query: Joi.object({
        username: Joi.string().required(),
        limit: Joi.number().integer().min(1).max(100).default(15)
      })
    },
    pre: [ { method: (request) => request.server.methods.auth.users.searchUsernames(request.server, request.auth) } ]
  },
  handler: function(request) {
    // get user by username
    var searchStr = request.query.username;
    var limit = request.query.limit;
    var promise = request.db.users.searchUsernames(searchStr, limit)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
