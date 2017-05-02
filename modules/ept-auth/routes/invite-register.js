var Joi = require('joi');
var Boom = require('boom');
var Promise = require('bluebird');

/**
  * @api {POST} /join Register (via invitation)
  * @apiName InvitationRegister
  * @apiGroup Auth
  * @apiVersion 0.4.0
  * @apiDescription Used to register a new account via invitation.
  *
  * @apiParam (Payload) {string} hash User's Invitation Hash.
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
  * @apiSuccess {string[]} moderating Array of user's moderated board ids
  * @apiSuccess {string[]} roles Array of user's roles
  *
  * @apiError (Error 400) BadRequest There was an error creating the user via invitation.
  * @apiError (Error 500) InternalServerError There was an issue registering user
  */
module.exports = {
  method: 'POST',
  path: '/api/join',
  config: {
    auth: { mode: 'try', strategy: 'jwt' },
    validate: {
      payload: {
        hash: Joi.string().max(255).required(),
        inviteEmail: Joi.string().email().required(),
        username: Joi.string().regex(/^[a-zA-Z\d-_.]+$/).min(3).max(255).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(72).required(),
        confirmation: Joi.ref('password')
      }
    },
    pre: [ { method: 'auth.auth.register(server, payload.email, payload.username)' } ]
  },
  handler: function(request, reply) {
    // check if already logged in with jwt
    if (request.auth.isAuthenticated) {
      var loggedInUser = request.auth.credentials;
      return reply(request.session.formatUserReply(loggedInUser.token, loggedInUser));
    }

    // verify hash
    var invite = { hash: request.payload.hash, email: request.payload.inviteEmail };
    var promise = request.db.users.verifyInvite(invite)
    .then(function(inviteValid) {
      if (inviteValid) { return invite.email; }
      else { return Promise.reject(Boom.badData('Invitation Not Valid')); }
    })
    .then(request.db.users.removeInvite)
    .then(function() {
      return {
        username: request.payload.username,
        email: request.payload.email,
        password: request.payload.password,
        confirmation_token: null
      };
    })
    .then(request.db.users.create)
    // set newbie role
    .tap(function(user) {
      return request.db.roles.addRoles([user.username], 'CN0h5ZeBTGqMbzwVdMWahQ');
    })
    .then(request.session.save)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
