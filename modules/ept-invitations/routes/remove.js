var Joi = require('@hapi/joi');

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
  * @apiError (Error 500) InternalServerError There was an error removing the invite
  */
module.exports = {
  method: 'POST',
  path: '/api/invites/remove',
  options: {
    auth: { strategy: 'jwt' },
    validate: {
      payload: Joi.object({ email: Joi.string().email().required() })
    },
    pre: [ { method: (request) => request.server.methods.auth.invitations.remove(request.server, request.auth, request.payload.email) } ]
  },
  handler: function(request) {
    // remove invitation
    var email = request.payload.email;
    var promise = request.db.invitations.remove(email)
    .then(function() { return { message: 'Invitation Removed.' }; })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
