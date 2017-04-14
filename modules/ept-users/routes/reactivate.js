var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {POST} /users/:userId/reactivate Reactivate
  * @apiName ReactivateUser
  * @apiDescription Reactivate a user by userId
  *
  * @apiParam {string} id The userId of the user to reactivate
  *
  * @apiSuccess {object} STATUS 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an error reactivating the user
  */
module.exports = {
  method: 'POST',
  path: '/api/users/{id}/reactivate',
  config: {
    app: { user_id: 'params.id' },
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'users.reactivate',
        data: { id: 'params.id' }
      }
    },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: 'auth.users.activate(server, auth, params.id)' } ],
  },
  handler: function(request, reply) {
    var userId = request.params.id;
    var promise = request.db.users.reactivate(userId)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
