var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Bans
  * @api {PUT} /users/ban/board (Admin) Ban From Boards
  * @apiName BanFromBoardsAdmin
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription This allows Administrators and Moderators to ban users from boards.
  *
  * @apiParam (Payload) {string} user_id The unique id of the user to ban from boards
  * @apiParam (Payload) {string[]} board_ids Array of board ids to ban the user from
  *
  * @apiSuccess {string} user_id The unique id of the user being banned from boards
  * @apiSuccess {string[]} board_ids Array of board ids to ban the user from
  *
  * @apiError (Error 500) InternalServerError There was an error banning the user from Boards
  * @apiError (Error 403) Forbidden User tried to ban from a board they do not moderate, or tried
  * to ban a user with higher permissions than themselves
  */
module.exports = {
  method: 'PUT',
  path: '/api/users/ban/boards',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      acls: 'bans.banFromBoards',
      mod_log: {
        type: 'bans.banFromBoards',
        data: {
          user_id: 'payload.user_id',
          board_ids: 'payload.board_ids'
        }
      }
    },
    validate: {
      payload: {
        user_id: Joi.string().required(),
        board_ids: Joi.array().items(Joi.string().required()).unique().min(1).required()
      }
    },
    pre: [ { method: 'auth.bans.banFromBoards(server, auth, payload.user_id, payload.board_ids)' } ]
  },
  handler: function(request, reply) {
    var userId = request.payload.user_id;
    var boardIds = request.payload.board_ids;
    var promise = request.db.bans.banFromBoards(userId, boardIds)
    .tap(function(user) {
      var notification = {
        channel: { type: 'user', id: user.user_id },
        data: { action: 'reauthenticate' }
      };
      request.server.plugins.notifications.systemNotification(notification);
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
