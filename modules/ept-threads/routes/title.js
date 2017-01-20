var Joi = require('joi');
var Boom = require('boom');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {POST} /threads/:id Title
  * @apiName UpdateThreadTitle
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator, User (Thread Author Only)
  * @apiDescription Used to update the title of a thread.
  *
  * @apiParam {string} id The unique id of the thread to update
  * @apiParam (Payload) {string} The new title for this thread.
  *
  * @apiUse ThreadObjectSuccess2
  *
  * @apiError Unauthorized User doesn't have permissions to update the thread title.
  * @apiError (Error 500) InternalServerError There was an issue updating the thread title.
  */
module.exports = {
  method: 'POST',
  path: '/api/threads/{id}',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'threads.title',
        data: {
          title: 'payload.title',
          id: 'params.id'
        }
      }
    },
    validate: {
      params: { id: Joi.string().required() },
      payload: { title: Joi.string().min(1).max(255).required() }
    },
    pre: [ { method: 'auth.threads.title(server, auth, params.id)', assign: 'post' } ]
  },
  handler: function(request, reply) {
    var post = {
      id: request.pre.post.id,
      thread_id: request.params.id,
      title: request.payload.title
    };
    var promise = request.db.posts.update(post)
    .error(function() { return Boom.notFound(); });
    return reply(promise);
  }
};
