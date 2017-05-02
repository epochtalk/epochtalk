var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Conversations
  * @api {DELETE} /conversations/:id Delete
  * @apiName DeleteConversation
  * @apiPermission Admin
  * @apiDescription Used to delete a conversation.
  *
  * @apiParam {string} id The Id of the conversation to delete
  *
  * @apiSuccess {string} id The unique id of the conversation being deleted
  * @apiSuccess {string} sender_id The unique id of the sender
  * @apiSuccess {string} receiver_id The unique id of the receiver
  *
  * @apiError (Error 500) InternalServerError There was an issue deleting the conversation
  */
module.exports = {
  method: 'DELETE',
  path: '/api/conversations/{id}',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'conversations.delete',
        data: {
          id: 'params.id',
          sender_id: 'route.settings.plugins.mod_log.metadata.sender_id',
          receiver_id: 'route.settings.plugins.mod_log.metadata.receiver_id'
         }
      }
    },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: 'auth.conversations.delete(server, auth)' } ],
  },
  handler: function(request, reply) {
    var promise = request.db.conversations.delete(request.params.id)
    .then(function(deletedConvo) {
      // append receiver and sender ids to plugin metadata
      request.route.settings.plugins.mod_log.metadata = {
        sender_id: deletedConvo.sender_id,
        receiver_id: deletedConvo.receiver_id
      };
      return deletedConvo;
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
