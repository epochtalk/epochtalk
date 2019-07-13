var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Bans
  * @api {PUT} /users/unban (Admin) Unban
  * @apiName UnbanUsersAdmin
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription This allows Administrators and Moderators to unban users. Ban expiration
  * is set to current timestamp, expiring it immediately
  *
  * @apiParam (Payload) {string} user_id The unique id of the user to unban
  *
  * @apiSuccess {string} id The unique id of the row in users.bans
  * @apiSuccess {string} user_id The unique id of the user being unbanned
  * @apiSuccess {object[]} roles Array containing users roles
  * @apiSuccess {timestamp} expiration Timestamp of when the user's ban expires (current timestamp)
  * @apiSuccess {timestamp} created_at Timestamp of when the ban was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the ban was last updated
  *
  * @apiError (Error 500) InternalServerError There was an error unbanning the user
  */
module.exports = {
  method: 'PUT',
  path: '/api/users/unban',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'bans.unban',
        data: { user_id: 'payload.user_id' }
      }
    },
    validate: { payload: { user_id: Joi.string().required() } },
    pre: [ { method: 'auth.bans.ban(server, auth, request.payload.user_id)' } ],
  },
  handler: function(request, reply) {
    var userId = request.payload.user_id;
    var promise = request.db.bans.unban(userId)
    .tap(function(user) {
      var notification = {
        channel: { type: 'user', id: user.user_id },
        data: { action: 'reauthenticate' }
      };
      request.server.plugins.notifications.systemNotification(notification);
    })
    .then(function(user) {
      return request.session.updateRoles(user.user_id, user.roles)
      .then(function() { return request.session.updateBanInfo(user.user_id); })
      .then(function() { return user; });
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
