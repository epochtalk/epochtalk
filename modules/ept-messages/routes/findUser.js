var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Messages
  * @api {GET} /messages/users/{username} Message Receiver Lookup
  * @apiName FindUserMessages
  * @apiPermission User
  * @apiDescription Querry possible username matches and returns their ids for use in message delivery
  *
  * @apiParam {string} username The name of the user to send the message to
  *
  * @apiSuccess {object[]} users An array of possible username matches
  * @apiSuccess {string} users.id The id of the user
  * @apiSuccess {string} users.username The username of th user
  *
  * @apiError (Error 500) InternalServerError There was an issue looking up usernames
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
