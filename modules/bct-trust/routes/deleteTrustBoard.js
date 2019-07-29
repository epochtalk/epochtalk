var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Trust
  * @api {DELETE} /admin/trustboards/:board_id Delete Trust Board
  * @apiName DeleteTrustBoard
  * @apiPermission Super Administrator
  * @apiDescription Used to remove trust score from a specific board
  *
  * @apiParam (Params) {string} board_id The unique id of the board to hide trust scores on
  *
  * @apiSuccess {string} board_id The unique id of the board to hide trust scores on.
  *
  * @apiError (Error 403) Forbidden User does not have permissions to delete trust boards
  * @apiError (Error 500) InternalServerError There was an issue deleting trust board
  */
module.exports = {
  method: 'DELETE',
  path: '/api/admin/trustboards/{board_id}',
  options: {
    auth: { strategy: 'jwt' },
    validate: { params: { board_id: Joi.string().required() } },
    pre: [ { method: (request) => request.server.methods.auth.userTrust.deleteTrustBoard(request.server, request.auth) } ]
  },
  handler: function(request, reply) {
    var promise = request.db.userTrust.deleteTrustBoard(request.params.board_id)
    .error(request.errorMap.toHttpError);
    return promise;
  }
};
