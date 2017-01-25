var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {POST} /threads/:id Find
  * @apiName FindThread
  * @apiDescription Used to find an existing thread.
  *
  * @apiParam {string} id The unique id of the thread to find
  *
  * @apiUse ThreadObjectSuccess2
  *
  * @apiError (Error 500) InternalServerError There was an issue looking up the thread
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
