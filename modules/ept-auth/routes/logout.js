var Boom = require('boom');

/**
  * @api {DELETE} /logout Logout
  * @apiName Logout
  * @apiGroup Auth
  * @apiVersion 0.4.0
  * @apiDescription Used to log a user out of their account.
  *
  * @apiSuccess {boolean} success true if user is successfully logged out
  *
  * @apiError BadRequest No user is currently logged in
  * @apiError (Error 500) InternalServerError There was an issue deleteing user's web token
  */
module.exports = {
  method: 'DELETE',
  path: '/api/logout',
  config: {
    auth: { mode: 'try', strategy: 'jwt' }
  },
  handler: function(request, reply) {
    // check if already logged in with jwt
    if (!request.auth.isAuthenticated) { return reply(Boom.unauthorized()); }

    // deletes session, deletes user, no return
    var creds = request.auth.credentials;
    var promise = request.session.delete(creds.sessionId, creds.id)
    .tap(function() {
      var notification = {
        channel: { type: 'user', id: creds.id },
        data: {
          action: 'logout',
          sessionId: creds.sessionId
        }
      };
      request.server.plugins.notifications.systemNotification(notification);
    });
    return reply(promise);
  }
};
