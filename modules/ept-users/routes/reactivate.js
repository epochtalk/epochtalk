var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {POST} /users/:id/reactivate Reactivate
  * @apiName ReactivateUser
  * @apiDescription Reactivate a user by userId
  *
  * @apiParam {string} id The id of the user to reactivate
  *
  * @apiSuccess {object} status 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an error reactivating the user
  */
module.exports = {
  method: 'POST',
  path: '/api/users/{id}/reactivate',
  options: {
    app: { user_id: 'params.id' },
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'users.reactivate',
        data: { id: 'params.id' }
      }
    },
    validate: { params: Joi.object({ id: Joi.string().required() }) },
    pre: [ { method: (request) => request.server.methods.auth.users.activate(request.server, request.auth, request.params.id) } ],
  },
  handler: function(request) {
    var userId = request.params.id;
    var promise = request.db.users.reactivate(userId)
    .then(function() { return {}; })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
