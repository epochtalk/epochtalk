var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var crypto = require('crypto');

/**
  * @api {GET} /recover/:query Recover Account
  * @apiName AccountRecoveryReq
  * @apiGroup Auth
  * @apiVersion 0.4.0
  * @apiDescription Used to recover an account by username or email. Sends an email with
  * a URL to visit to reset the user's account password.
  *
  * @apiParam {string} query The email or username to attempt to recover
  *
  * @apiSuccess {boolean} success true if recovery email is sent
  * @apiError BadRequest The username or email is not found
  * @apiError (Error 500) InternalServerError There was an error updating the user account's reset token information
  */
module.exports = {
  method: 'POST',
  path: '/api/admin/recover',
  config: {
    auth: { strategy: 'jwt' },
    plugins: { acls: 'adminUsers.resetPassword' },
    validate: { payload: { userId: Joi.string().required() } }
  },
  handler: function(request, reply) {
    var userId = request.payload.userId;
    var config = request.server.app.config;

    var promise = request.db.users.find(userId)
    .then(function(user) {
      if (user) { return user; }
      else { return Promise.reject(Boom.badRequest('No Account Found')); }
    })
    // Build updated user with resetToken and resetExpiration
    .then(function(user) {
      var updateUser = {};
      updateUser.reset_token = crypto.randomBytes(20).toString('hex');
      updateUser.reset_expiration = Date.now() + 1000 * 60 * 60; // 1 hr
      updateUser.id = user.id;
      // Store token and expiration to user object
      return request.db.users.update(updateUser);
    })
    // Email user reset information here
    .then(function(user) {
      var emailParams = {
        email: user.email,
        username: user.username,
        siteName: config.website.title,
        reset_url: config.publicUrl + '/' + path.join('reset', user.username, user.reset_token)
      };
      request.server.log('debug', emailParams);
      return request.emailer.send('recoverAccount', emailParams);
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
