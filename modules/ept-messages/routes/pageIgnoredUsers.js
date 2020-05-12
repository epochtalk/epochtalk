var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Messages
  * @api {GET} /messages/ignored Page Ignored Users
  * @apiName PageIgnoredUserMessages
  * @apiPermission User
  * @apiDescription Used to page through user's whos messages are being ignored
  *
  * @apiParam (Query) {number} [page] The page of ignored users to return
  * @apiParam (Query) {number} [limit] The number ignored users to return per page
  *
  * @apiSuccess {number} page The page of ignored users being returned
  * @apiSuccess {number} limit The number ignored users being returned per page
  * @apiSuccess {boolean} prev Boolean indicating if there is a previous page
  * @apiSuccess {boolean} next Boolean indicating if there is a next page
  * @apiSuccess {object[]} data Array containing ignored users
  * @apiSuccess {string} data.username The name of the user being ignored
  * @apiSuccess {string} data.id The id of the user being ignored
  * @apiSuccess {string} data.avatar The avatar of the user being ignored
  * @apiSuccess {boolean} data.ignored Boolean indicating if the user's messages are being ignored
  *
  * @apiError (Error 500) InternalServerError There was an error paging ignored users
  */
module.exports = {
  method: 'GET',
  path: '/api/messages/ignored',
  options: {
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: {
      query: Joi.object({
        limit: Joi.number(),
        page: Joi.number()
      })
    }
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;
    var opts = {
      limit: request.query.limit,
      page: request.query.page
    };
    var promise = request.db.messages.pageIgnoredUsers(userId, opts)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
