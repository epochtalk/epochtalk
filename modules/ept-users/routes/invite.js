var Joi = require('joi');
var crypto = require('crypto');

/**
  * @api {POST} /invites Invite
  * @apiName Invite
  * @apiGroup Users
  * @apiVersion 0.4.0
  * @apiDescription Used to invite a user to join via email.
  *
  * @apiParam (Payload) {string} email User's email address.
  *
  * @apiSuccess {string} message Invitation sent success message
  * @apiSuccess {string} confirm_token Invitation token
  *
  * @apiError BadRequest There was an error creating the invitation
  */
module.exports = {
  method: 'POST',
  path: '/api/invites',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      payload: { email: Joi.string().email().required() }
    },
    pre: [ { method: 'auth.users.invite(server, auth, payload.email)' } ]
  },
  handler: function(request, reply) {
    var newUser = {
      email: request.payload.email,
      hash: crypto.randomBytes(20).toString('hex')
    };

    // save invitation
    var promise = request.db.users.invite(newUser)
    // send invitation email
    .then(function() {
      var config = request.server.app.config;
      var inviteUrl = `${config.publicUrl}/join?token=${newUser.hash}&email=${newUser.email}`;
      var emailParams = {
        email: newUser.email,
        site_name: config.website.title,
        invite_url: inviteUrl
      };
      request.server.log('debug', emailParams);
      request.emailer.send('invite', emailParams);
      return {
        message: 'Successfully Sent Invitation',
        confirm_token: newUser.hash
      };
    })
    .error(request.errorMap.toHttpError);


    return reply(promise);
  }
};
