var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {POST} /users/:userId/deactivate Deactivate
  * @apiName DeactivateUser
  * @apiDescription Deactivate a user by userId
  *
  * @apiParam {string} id The userId of the user to deactivate
  *
  * @apiSuccess {object} STATUS 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an error deactivating the user
  */
module.exports = {
  method: 'POST',
  path: '/api/users/{id}/deactivate',
  config: {
    app: { user_id: 'params.id' },
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'users.deactivate',
        data: { id: 'params.id' }
      }
    },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: 'auth.users.deactivate(server, auth, params.id)' } ],
  },
  handler: function(request, reply) {
    var userId = request.params.id;
    var promise = request.db.users.deactivate(userId);
    return reply(promise);
  }
};
