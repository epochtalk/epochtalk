var Joi = require('@hapi/joi');

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
  * @apiSuccess {string} receiver_ids The unique ids of the receivers
  *
  * @apiError (Error 500) InternalServerError There was an issue deleting the conversation
  */
module.exports = {
  method: 'DELETE',
  path: '/api/conversations/{id}',
  options: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'conversations.delete',
        data: {
          id: 'params.id',
          sender_id: 'route.settings.plugins.mod_log.metadata.sender_id',
          receiver_ids: 'route.settings.plugins.mod_log.metadata.receiver_ids'
         }
      }
    },
    validate: { params: Joi.object({ id: Joi.string().required() }) },
    pre: [ { method: (request) => request.server.methods.auth.conversations.delete(request.server, request.auth) } ],
  },
  handler: function(request) {
    var userId = request.auth.credentials.id;
    var promise = request.db.conversations.delete(request.params.id, userId)
    .then(function(deletedConvo) {
      // append receivers and sender ids to plugin metadata
      request.route.settings.plugins.mod_log.metadata = {
        sender_id: deletedConvo.sender_id,
        receiver_ids: deletedConvo.receiver_ids
      };
      return deletedConvo;
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
