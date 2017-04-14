var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Messages
  * @api {GET} /messages/users/{username} Get ID for username
  * @apiName FindUserMessages
  * @apiPermission User
  * @apiDescription Get the id for the given username
  *
  * @apiUse MessageObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue getting the messages
  */
module.exports = {
  method: 'GET',
  path: '/api/messages/users/{username}',
  config: {
    auth: { strategy: 'jwt' },
    validate: { params: { username: Joi.string().required() } },
    pre: [ { method: 'auth.messages.findUser(server, auth)' } ]
  },
  handler: function(request, reply) {
    // get id for username
    var username = request.params.username;
    var promise = request.db.messages.findUser(username)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
