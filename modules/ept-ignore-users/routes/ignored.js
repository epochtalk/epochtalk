var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {GET} /ignoreUsers/ignored Page Ignored Users
  * @apiName PageIgnoredUsers
  * @apiPermission User
  * @apiDescription Used to page through ignored users
  *
  * @apiParam {number} [page=1] The page of ignored users to return
  * @apiParam {number} [limit=25] The number of ignored users to return per page
  *
  * @apiSuccess {number} page The page of ignored users being returned
  * @apiSuccess {number} limit The number of ignored users being returned per page
  * @apiSuccess {boolean} prev Boolean indicating if there is a previous page
  * @apiSuccess {boolean} next Boolean indicating if there is a next page
  * @apiSuccess {object[]} data Array of ignored users
  * @apiSuccess {string} data.id The id of the user being ignored
  * @apiSuccess {timestamp} data.ignored_since Timestamp of when the user was ignored
  * @apiSuccess {string} data.username The username of the user being ignored
  * @apiSuccess {string} data.avatar The avatar of the user being ignored
  * @apiSuccess {boolean} data.ignored Boolean indicating if the user is ignored
  *
  * @apiError (Error 500) InternalServerError There was an error ignoring the user's posts
  */
module.exports = {
  method: 'GET',
  path: '/api/ignoreUsers/ignored',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        limit: Joi.number().default(25),
        page: Joi.number().default(1)
      }
    },
  },
  handler: function(request, reply) {
    var userId = request.auth.credentials.id;
    var opts = {
      page: request.query.page,
      limit: request.query.limit
    };

    var promise = request.db.ignoreUsers.ignored(userId, opts)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
