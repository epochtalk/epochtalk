var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {POST} /threads/:id Mark Thread Viewed
  * @apiName ViewThread
  * @apiDescription Used to mark a thread as viewed
  *
  * @apiParam {string} id The unique id of the thread to mark as viewed
  *
  * @apiSuccess {object} success 200 OK
  *
  * @apiError (Error 500) InternalServerError There was an issue marking the thread viewed
  */
module.exports = {
  method: 'POST',
  path: '/api/threads/{id}/viewed',
  config: {
    auth: { mode: 'try', strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [
      [ { method: 'auth.threads.viewed(server, auth, params.id)' } ],
      [
        { method: 'common.threads.checkView(server, headers, info, params.id)', assign: 'newViewId' },
        { method: 'common.threads.updateView(server, auth, params.id)' }
      ]
    ]
  },
  handler: function(request, reply) {
    var newViewerId = request.pre.newViewId;
    if (newViewerId) { return reply().header('Epoch-Viewer', newViewerId); }
    else { return reply(); }
  }
};
