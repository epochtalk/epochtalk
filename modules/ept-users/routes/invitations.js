var Joi = require('joi');

/**
  * @api {GET} /invites Invitations
  * @apiName Invitations
  * @apiGroup Users
  * @apiVersion 0.4.0
  * @apiDescription Used to page through current invitations.
  *
  * @apiParam (Payload) {string} [page=1] The page of invitations to bring back.
  * @apiParam (Payload) {string} [limit=25] The number of invitations to bring back.
  *
  * @apiSuccess {number} page The page of invitations to return
  * @apiSuccess {number} limit The number of invitations to return per page
  * @apiSuccess {boolean} hasMore Boolean indicating if there are more results on the next page
  * @apiSuccess {object[]} invitations An array containing invitations.
  * @apiSuccess {string} invitations.email The email of the user who was invited
  * @apiSuccess {string} invitations.hash The user's invite has
  * @apiSuccess {timestamp} invitations.created_at The invite created at timestamp
  *
  * @apiError BadRequest There was an error paging invitations.
  */
module.exports = {
  method: 'GET',
  path: '/api/invites',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        page: Joi.number().integer().default(1),
        limit: Joi.number().integer().min(1).max(100).default(25)
      }
    },
    pre: [ { method: 'auth.users.invitations(server, auth)' } ]
  },
  handler: function(request, reply) {
    // adjust limit to check if there's another page
    var opts = {
      page: request.query.page,
      limit: request.query.limit + 1
    };

    // query invitations
    var promise = request.db.users.invitations(opts)
    .then(function(invitations) {
      // check if more invitations exists
      var hasMore = false;
      if (invitations.length > request.query.limit) {
        hasMore = true;
        invitations.pop();
      }

      return {
        page: request.query.page,
        limit: request.query.limit,
        invitations: invitations,
        hasMore: hasMore
      };
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
