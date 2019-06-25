/**
  * @apiVersion 0.4.0
  * @apiGroup Trust
  * @api {GET} /admin/trustboards Get Trust Boards
  * @apiName GetTrustBoards
  * @apiDescription Retrieve array of board ids to show trust scores on
  *
  * @apiSuccess {string[]} trusted_boards Array of trusted board ids
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving array of trusted boards.
  */
module.exports = {
  method: 'GET',
  path: '/api/trustboards',
  config: { auth: { strategy: 'jwt' } },
  handler: function(request, reply) {
    var promise = request.db.userTrust.getTrustBoards()
    .error(request.errorMap.toHttpError);
    return reply(promise);
  }
};
