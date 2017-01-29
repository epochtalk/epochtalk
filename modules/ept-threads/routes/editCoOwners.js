var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {PUT} /threads/:threadId/coOwners Update users for a thread
  * @apiName UpdateThreadOwners
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator, User (that created the thread)
  * @apiDescription Used to update thread users.
  *
  * @apiParam (Param) {string} thread_id The unique id of the thread the poll is in.
  * @apiParam (Payload) {array} users The updated users
  *
  * @apiError Unauthorized User doesn't have permissions to update this thread
  * @apiError (Error 500) InternalServerError There was an issue updating the thread
  */
module.exports = {
  method: 'PUT',
  path: '/api/threads/{threadId}/coOwners',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'threads.editCoOwners',
        data: {
          thread_id: 'params.threadId',
          owners_data: 'payload'
        }
      }
    },
    validate: {
      params: {
        threadId: Joi.string().required()
      },
      payload: Joi.object().keys({
        users: Joi.array().required()
      })
    }
  },
  handler: function(request, reply) {
    var options = request.payload;
    options.threadId = request.params.threadId;

    return reply(request.db.threads.editOwners(options));
  }
};
