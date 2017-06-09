var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var crypto = require('crypto');

/**
  * @api {POST} /register Register (w/o account verification)
  * @apiName RegisterNoVerify
  * @apiGroup Auth
  * @apiVersion 0.4.0
  * @apiDescription Used to register a new account with account verification disabled in admin settings.
  *
  * @apiParam (Payload) {string} username User's unique username.
  * @apiParam (Payload) {string} email User's email address.
  * @apiParam (Payload) {string} password User's password
  * @apiParam (Payload) {string} confirmation User's confirmed password
  *
  * @apiSuccess {string} token User's authentication token
  * @apiSuccess {string} id User's unique id
  * @apiSuccess {string} username The user account username
  * @apiSuccess {string} avatar User's avatar url
  * @apiSuccess {object} permissions Object containing user's permissions
  * @apiSuccess {string[]} roles Array of user's roles
  *
  * @apiError BadRequest There was an error creating the user
  */
/**
  * @api {POST} /register Register (w/ account verification)
  * @apiName RegisterVerify
  * @apiGroup Auth
  * @apiVersion 0.4.0
  * @apiDescription Used to register a new account with account verification enabled in admin settings. This will send an email to the user with the account verification link.
  *
  * @apiParam (Payload) {string} username User's unique username.
  * @apiParam (Payload) {string} email User's email address.
  * @apiParam (Payload) {string} password User's password
  * @apiParam (Payload) {string} confirmation User's confirmed password
  *
  * @apiSuccess {string} message Account creation success message
  * @apiSuccess {string} username Created user's username
  * @apiSuccess {string} confirm_token Created user's account confirmation token
  * @apiSuccess {string} avatar User's avatar url
  *
  * @apiError (Error 400) BadRequest There was an error registering the user
  */
module.exports = {
  method: 'POST',
  path: '/api/register',
  config: {
    auth: { mode: 'try', strategy: 'jwt' },
    validate: {
      payload: {
        username: Joi.string().regex(/^[a-zA-Z\d-_.]+$/).min(3).max(255).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(72).required(),
        confirmation: Joi.ref('password')
      }
    },
    pre: [ { method: 'auth.auth.register(server, payload.email, payload.username)' } ]
  },
  handler: function(request, reply) {
    var config = request.server.app.config;

    // check if registration is open
    if (config.inviteOnly) {
      return reply(Boom.locked('Registration is Closed'));
    }

    // check if already logged in with jwt
    if (request.auth.isAuthenticated) {
      var loggedInUser = request.auth.credentials;
      return reply(request.session.formatUserReply(loggedInUser.token, loggedInUser));
    }

    // create new user
    var newUser = {
      username: request.payload.username,
      email: request.payload.email,
      password: request.payload.password,
      confirmation_token: config.verifyRegistration ? crypto.randomBytes(20).toString('hex') : null
    };
    var promise = request.db.users.create(newUser)
    // set newbie role
    .tap(function(user) {
      return request.db.roles.addRoles([user.username], 'CN0h5ZeBTGqMbzwVdMWahQ');
    })
    // send confirmation email
    .then(function(user) {
      if (config.verifyRegistration) {
        var confirmUrl = config.publicUrl + '/' + path.join('confirm', user.username, user.confirmation_token);
        var emailParams = {
          email: user.email,
          username: user.username,
          site_name: config.website.title,
          confirm_url: confirmUrl
        };
        request.server.log('debug', emailParams);
        request.emailer.send('confirmAccount', emailParams);
        return {
          message: 'Successfully Created Account',
          username: user.username,
          confirm_token: user.confirmation_token
        };
      }
      else { return user; }
    })
    // TODO: Move to post handler code
    // check malicious score and ban if necessary
    .then(function(createdUser) {
      createdUser.avatar = '/static/img/avatar.png';
      if (config.verifyRegistration) { return createdUser; }
      else {
        var ip = request.headers['x-forwarded-for'] || request.info.remoteAddress;
        var opts = { ip: ip, userId: createdUser.id };
        return request.db.bans.getMaliciousScore(opts)
        .then(function(score) {
          // User has a malicious score less than 1 let them register
          if (score < 1) { return createdUser; }
          // User has a malicious score higher than 1 ban the account
          else {
            return request.db.bans.ban(createdUser.id)
            .then(function(banInfo) {
              createdUser.malicious_score = score;
              createdUser.roles = banInfo.roles;
              createdUser.ban_expiration = banInfo.expiration;
              return createdUser;
            });
          }
        })
        .then(request.session.save);
      }
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
