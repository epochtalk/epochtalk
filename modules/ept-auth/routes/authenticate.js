var Boom = require('boom');

/**
  * @api {GET} /authenticate Authenticate User
  * @apiName Authenticate User
  * @apiGroup Auth
  * @apiVersion 0.4.0
  * @apiDescription Used to check the logged in user's authentication.
  *
  * @apiSuccess {string} token User's unique session token
  * @apiSuccess {string} id User's unique id
  * @apiSuccess {string} username User's username
  * @apiSuccess {string} avatar User's avatar url
  * @apiSuccess {string[]} roles Array of user's roles lookup strings
  * @apiSuccess {string[]} moderating Array of user's moderatered board ids
  * @apiSuccess {object} permissions Object containing user's permissions
  *
  * @apiError (Error 401) Unauthorized returned when user is not authenticated
  */

module.exports = {
  method: 'GET',
  path: '/api/authenticate',
  options: { auth: { mode: 'try', strategy: 'jwt' } },
  handler: function(request) {
    // check if already logged in with jwt
    if (request.auth.isAuthenticated) {
      var user = request.auth.credentials;
      return request.session.formatUserReply(user.token, user);
    }
    else {
      return Boom.unauthorized('Session is no longer valid.');
    }
  }
};
