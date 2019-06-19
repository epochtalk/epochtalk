var Joi = require('joi');

/**
  * @api {GET} /invites/exists Invitation Exists
  * @apiName InvitationsExists
  * @apiGroup Users
  * @apiVersion 0.4.0
  * @apiDescription Used to check if an invitation has already been sent to an address.
  *
  * @apiParam (Query) {string} email The email to check
  *
  * @apiSuccess {boolean} found true if the email already has an invite.
  *
  * @apiError BadRequest There was an error checking if the invitation exists.
  */
module.exports = {
  method: 'GET',
  path: '/api/invites/exists',
  config: {
    auth: { strategy: 'jwt' },
    validate: { query: { email: Joi.string().email().required() } }
  },
  handler: function(request, reply) {
    // query invitations
    var promise = request.db.invitations.hasInvitation(request.query.email)
    .then(function(result) {
      return { found: result };
    })
    .error(request.errorMap.toHttpError);
    return reply(promise);
  }
};
