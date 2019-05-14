var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Bans
  * @api {GET} /users/:username/bannedboards (Admin) Get User's Banned Boards
  * @apiName GetBannedBoardsAdmin
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription This allows Administrators and Moderators to retrieve a list of boards
  * that a user has been banned from.
  *
  * @apiParam {string} username The username of the user to get banned boards for
  *
  * @apiSuccess {object[]} banned_boards An array of boards that the user is banned from
  * @apiSuccess {string} banned_boards.id The id of the board the user is banned from
  * @apiSuccess {string} banned_boards.name The name of the board the user is banned from
  *
  * @apiError (Error 500) InternalServerError There was an error retrieving the user's banned boards
  * @apiError (Error 403) Forbidden User doesn't have permission to query for user's banned boards
  */
module.exports = {
  method: 'GET',
  path: '/api/users/{username}/bannedboards',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { acls: 'bans.getBannedBoards' },
    validate: { params: { username: Joi.string().required() } }
  },
  handler: function(request, reply) {
    var username = request.params.username;
    var promise = request.db.bans.getBannedBoards(username)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
