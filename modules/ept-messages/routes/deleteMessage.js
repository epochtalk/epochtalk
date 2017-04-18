var Joi = require('joi');
var Boom = require('boom');

/**
  * @apiVersion 0.4.0
  * @apiGroup Messages
  * @api {DELETE} /messages/:id Delete
  * @apiName DeleteMessage
  * @apiPermission User (Message's Author) or Admin
  * @apiDescription Used to delete a message.
  *
  * @apiParam {string} id The Id of the message to delete
  *
  * @apiSuccess {string} id The unique id of the message being deleted
  * @apiSuccess {string} sender_id The unique id of the user that sent this message
  * @apiSuccess {string} receiver_id The unique id of the user that sent this message
  *
  * @apiError (Error 400) BadRequest Message Already Deleted
  * @apiError (Error 500) InternalServerError There was an issue deleting the message
  */
module.exports = {
  method: 'DELETE',
  path: '/api/messages/{id}',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'messages.delete',
        data: {
          id: 'params.id',
          sender_id: 'route.settings.plugins.mod_log.metadata.sender_id',
          receiver_id: 'route.settings.plugins.mod_log.metadata.receiver_id'
        }
      }
    },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: 'auth.messages.delete(server, auth, params.id)' } ]
  },
  handler: function(request, reply) {
    var promise = request.db.messages.delete(request.params.id)
    .then(function(deletedMessage) {
      // appender receiver and sender ids to plugin metadata
      request.route.settings.plugins.mod_log.metadata = {
        sender_id: deletedMessage.sender_id,
        receiver_id: deletedMessage.receiver_id
      };
      return deletedMessage;
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
