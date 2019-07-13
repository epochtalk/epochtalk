var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Bans
  * @api {PUT} /users/ban (Admin) Ban
  * @apiName BanUsersAdmin
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription This allows Administrators and Moderators to ban users.
  *
  * @apiParam (Payload) {string} user_id The unique id of the user to ban
  * @apiParam (Payload) {timestamp} [expiration] The expiration date for the ban, when not defined ban is considered permanent
  * @apiParam (Payload) {boolean=false} [ip_ban=false] Boolean indicating that the user should be ip banned as well, this will make it so they cannot register from any of their known ips for a new account
  *
  * @apiSuccess {string} id The unique id of the row in users.bans
  * @apiSuccess {string} user_id The unique id of the user being banned
  * @apiSuccess {object[]} roles Array containing users roles
  * @apiSuccess {timestamp} expiration Timestamp of when the user's ban expires
  * @apiSuccess {timestamp} created_at Timestamp of when the ban was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the ban was last updated
  *
  * @apiError (Error 500) InternalServerError There was an error banning the user
  */
module.exports = {
  method: 'PUT',
  path: '/api/users/ban',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'bans.ban',
        data: {
          user_id: 'payload.user_id',
          expiration: 'payload.expiration'
        }
      }
    },
    validate: {
      payload: {
        user_id: Joi.string().required(),
        expiration: Joi.date(),
        ip_ban: Joi.boolean().default(false)
      }
    },
    pre: [ { method: 'auth.bans.ban(request.server, auth, request.payload.user_id)' } ],
  },
  handler: function(request, reply) {
    var userId = request.payload.user_id;
    var expiration = request.payload.expiration || null;
    var ipBan = request.payload.ip_ban;
    var banPromise = request.db.bans.ban(userId, expiration)
    .tap(function(user) {
      var notification = {
        channel: { type: 'user', id: user.user_id },
        data: { action: 'reauthenticate' }
      };
      request.server.plugins.notifications.systemNotification(notification);
    })
    .then(function(user) {
      return request.session.updateRoles(user.user_id, user.roles)
      .then(function() { return request.session.updateBanInfo(user.user_id, user.expiration); })
      .then(function() { return user; });
    })
    .error(request.errorMap.toHttpError);

    // If user is being ip banned copy their known ips into banned_addresses
    if (ipBan) {
      // TODO: Can be customized by passing weight and decay in payload
      var opts = { userId: userId, weight: 50, decay: true };
      var ipBanPromise = request.db.bans.copyUserIps(opts);
      return Promise.join(banPromise, ipBanPromise, function(result) {
        return reply(result);
      })
      .error(request.errorMap.toHttpError);
    }
    else { return reply(banPromise); }
  }
};
