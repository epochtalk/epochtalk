var Joi = require('joi');

/**
  * @api {POST} /invites/remove Remove Invite
  * @apiName RemoveInvite
  * @apiGroup Users
  * @apiVersion 0.4.0
  * @apiDescription Used to remove an invite for a user via email.
  *
  * @apiParam (Payload) {string} email User's email address.
  *
  * @apiSuccess {string} message Invitation removal success message
  *
  * @apiError BadRequest There was an error removing the invitation
  */
module.exports = {
  method: 'POST',
  path: '/api/invites/remove',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      payload: { email: Joi.string().email().required() }
    },
    pre: [ { method: 'auth.users.removeInvite(server, auth, payload.email)' } ]
  },
  handler: function(request, reply) {
    // remove invitation
    var email = request.payload.email;
    var promise = request.db.users.removeInvite(email)
    .then(function() { return { message: 'Invitation Removed.' }; })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
