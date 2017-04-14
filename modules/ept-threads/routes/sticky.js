var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {POST} /threads/:id/sticky Sticky
  * @apiName StickyThread
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator
  * @apiDescription Used to sticky a thread. This will cause the thread to show up at the top of the board it's posted within.
  *
  * @apiParam {string} id The unique id of the thread to sticky
  * @apiParam (Payload) {boolean} status=true Boolean indicating sticky status, true if stickied false if not.
  *
  * @apiUse ThreadObjectSuccess2
  *
  * @apiError Unauthorized User doesn't have permissions to sticky the thread
  * @apiError (Error 500) InternalServerError There was an issue stickying the thread
  */
module.exports = {
  method: 'POST',
  path: '/api/threads/{id}/sticky',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'threads.sticky',
        data: {
          id: 'params.id',
          stickied: 'payload.status'
        }
      }
    },
    validate: {
      params: { id: Joi.string().required() },
      payload: { status: Joi.boolean().default(true) }
    },
    pre: [ { method: 'auth.threads.sticky(server, auth, params.id)' } ]
  },
  handler: function(request, reply) {
    var threadId = request.params.id;
    var sticky = request.payload.status;

    // sticky thread
    var promise = request.db.threads.sticky(threadId, sticky)
    .then(() => { return { id: threadId, sticky: sticky }; })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
