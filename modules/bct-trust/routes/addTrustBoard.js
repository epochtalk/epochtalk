var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Trust
  * @api {POST} /admin/trustboards Add Trust Board
  * @apiName AddTrustBoard
  * @apiPermission Super Administrator
  * @apiDescription Used to make trust scores visible on a specific board
  *
  * @apiParam (Payload) {string} board_id The unique id of the board to show trust scores on
  *
  * @apiSuccess {string} board_id The unique id of the board trust scores were added to
  *
  * @apiError (Error 403) Forbidden User does not have permissions to add a trust board
  * @apiError (Error 500) InternalServerError There was an issue adding board to trust boards
  */
module.exports = {
  method: 'POST',
  path: '/api/admin/trustboards',
  options: {
    auth: { strategy: 'jwt' },
    validate: { payload: { board_id: Joi.string().required() } },
    pre: [ { method: (request) => request.server.methods.auth.userTrust.addTrustBoard(request.server, request.auth) } ]
  },
  handler: function(request, reply) {
    var promise = request.db.userTrust.addTrustBoard(request.payload.board_id)
    .error(request.errorMap.toHttpError);
    return promise;
  }
};
