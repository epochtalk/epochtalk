var Joi = require('joi');
var Boom = require('boom');
var Promise = require('bluebird');

/**
  * @api {POST} /reset Reset Account Password
  * @apiName AccountRecoveryReset
  * @apiGroup Auth
  * @apiVersion 0.4.0
  * @apiDescription Used to reset an account password after recovering an account.
  *
  * @apiParam (Payload) {string} username The username of the user whose password is being reset
  * @apiParam (Payload) {string} password The new account password
  * @apiParam (Payload) {string} query The new account password confirmation
  * @apiParam (Payload) {string} token The token for resetting the account password
  *
  * @apiSuccess {string} message Password Successfully Reset
  *
  * @apiError (Error 400) BadRequest The user account could not be found or the reset token is invalid
  * @apiError (Error 500) InternalServerError There was an error updating the user account's reset token information
  */
module.exports = {
  method: 'POST',
  path: '/api/reset',
  options: {
    validate: {
      payload: {
        username: Joi.string().min(1).max(255).required(),
        password: Joi.string().min(8).max(72).required(),
        confirmation: Joi.ref('password'),
        token: Joi.string().token().required()
      }
    }
  },
  handler: function(request, reply) {
    var username = request.payload.username;
    var password = request.payload.password;
    var token = request.payload.token;
    var promise = request.db.users.userByUsername(username) // get full user info
    .then(function(user) {
      if (user) { return user; }
      else { return Promise.reject(Boom.badRequest('Account Not Found')); }
    })
    .then(function(user) {
      var now = Date.now();
      var tokenMatched = user.reset_token && user.reset_token === token;
      var expiryValid = user.reset_expiration && now < user.reset_expiration;
      if (tokenMatched && expiryValid) {
        return {
          id: user.id,
          reset_expiration: null,
          reset_token: null,
          confirmation_token: null,
          password: password
        };
      }
      else { return Promise.reject(Boom.badRequest('Invalid Reset Token.')); }
    })
    .then(request.db.users.update)
    // release any pressue on backoff
    .then(function() {
      var ip = request.info.remoteAddress;
      var pressureRelease = request.server.plugins.backoff.release;
      return pressureRelease(request.db.db, ip);
    })
    .then(function() {
      // TODO: Send password reset confirmation email here
      return 'Password Successfully Reset';
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
