var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var crypto = require('crypto');

/**
  * @api {POST} /user/recover/ (Admin) Recover Account
  * @apiName AccountRecoveryAdmin
  * @apiGroup Users
  * @apiVersion 0.4.0
  * @apiDescription Used by admins to recover a user's account. Sends an email to the account holder with a URL to visit to reset the account password.
  *
  * @apiParam (Payload) {string} user_id The id of the user's account to recover
  *
  * @apiSuccess {object} Sucess 200 OK
  * @apiError (Error 400) BadRequest The user was not found
  * @apiError (Error 500) InternalServerError There was an error recovering the user account
  */
module.exports = {
  method: 'POST',
  path: '/api/user/recover',
  options: {
    auth: { strategy: 'jwt' },
    validate: { payload: { user_id: Joi.string().required() } },
    pre: [ { method: (request) => request.server.methods.auth.users.adminRecover(request.server, request.auth) } ]
  },
  handler: function(request, reply) {
    var userId = request.payload.user_id;
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
    .tap(function(user) {
      var emailParams = {
        email: user.email,
        username: user.username,
        site_name: config.website.title,
        reset_url: config.publicUrl + '/' + path.join('reset', user.username, user.reset_token)
      };
      request.server.log('debug', emailParams);
      request.emailer.send('recoverAccount', emailParams);
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
