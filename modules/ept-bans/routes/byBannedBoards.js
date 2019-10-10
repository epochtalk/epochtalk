var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Bans
  * @api {GET} /users/banned (Admin) Page by Banned Boards
  * @apiName PageByBannedBoardsAdmin
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription This allows Administrators and Moderators to page through users who have been
  * banned from boards.
  *
  * @apiParam (Query) {number{1..n}} [page=1] The page of results to return
  * @apiParam (Query) {number{1..100}} [limit=25] The number of results per page to return
  * @apiParam (Query) {string} [search] username, email, or user id to filter results by
  * @apiParam (Query) {string} [board] board id to filter results by
  * @apiParam (Query) {boolean} [modded] booolean which indicates to only retun users who were banned
  * from boards in which the logged in user moderates
  *
  * @apiSuccess {number} page The current page of results that is being returned
  * @apiSuccess {number} limit The current number of results that is being returned per page
  * @apiSuccess {boolean} next boolean indicating if there is a next page
  * @apiSuccess {boolean} prev boolean indicating if there is a previous page
  * @apiSuccess {string} search The search text that the results are being filtered by
  * @apiSuccess {string} board The board id that the results are being filtered by
  * @apiSuccess {boolean} modded boolean indicating that the results being returned are within the
  * users moderated boards
  * @apiSuccess {object[]} data An array of board banned users and board data
  * @apiSuccess {string} data.username The username of the board banned user
  * @apiSuccess {string} data.user_id The id of the board banned user
  * @apiSuccess {string} data.email The email of the board banned user
  * @apiSuccess {string} data.created_at The created_at date of the board banned user's account
  * @apiSuccess {string[]} data.board_ids An array of the board ids this user is banned from
  * @apiSuccess {string[]} data.board_names An array of the board names this user is banned from
  *
  * @apiError (Error 500) InternalServerError There was an error paging board banned users
  * @apiError (Error 403) Forbidden User doesn't have permission to query board banned users
  */
module.exports = {
  method: 'GET',
  path: '/api/users/banned',
  options: {
    auth: { strategy: 'jwt' },
    validate: {
      query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(25),
        search: Joi.string(),
        board: Joi.string(),
        modded: Joi.boolean()
      })
    },
    pre: [ { method: (request) => request.server.methods.auth.bans.byBannedBoards(request.server, request.auth) } ]
  },
  handler: function(request) {
    var opts = {
      page: request.query.page,
      limit: request.query.limit,
      search: request.query.search,
      boardId: request.query.board,
      userId: request.query.modded ? request.auth.credentials.id : undefined
    };
    var promise = request.db.bans.byBannedBoards(opts)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
