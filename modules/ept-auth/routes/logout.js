var Boom = require('boom');

/**
  * @api {DELETE} /logout Logout
  * @apiName Logout
  * @apiGroup Auth
  * @apiVersion 0.4.0
  * @apiDescription Used to log a user out of their account.
  *
  * @apiSuccess {object} success 200 OK
  *
  * @apiError (Error 401) Unauthorized Occurs when logging out on a view that requires special permissions
  * @apiError (Error 400) BadRequest No user is currently logged in
  * @apiError (Error 500) InternalServerError There was an issue deleteing user's web token
  */
module.exports = {
  method: 'DELETE',
  path: '/api/logout',
  options: {
    auth: { mode: 'try', strategy: 'jwt' }
  },
  handler: function(request, reply) {
    // check if already logged in with jwt
    if (!request.auth.isAuthenticated) { return Boom.unauthorized(); }

    // deletes session, deletes user, no return
    var creds = request.auth.credentials;
    return request.session.delete(creds.sessionId, creds.id)
    .tap(function() {
      var notification = {
        channel: { type: 'user', id: creds.id },
        data: {
          action: 'logout',
          sessionId: creds.sessionId
        }
      };
      request.server.plugins.notifications.systemNotification(notification);
    })
    .then(() => true)
    .error(request.errorMap.toHttpError);
  }
};
