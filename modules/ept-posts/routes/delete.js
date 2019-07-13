var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {DELETE} /posts/:id Delete
  * @apiName DeletePost
  * @apiPermission User (Post's Author) or Admin
  * @apiDescription Used to delete a post.
  *
  * @apiParam {string} id The Id of the post to delete
  *
  * @apiUse PostObjectSuccess
  * @apiSuccess {number} position The position of the post within the thread
  * @apiSuccess {timestamp} updated_at The updated at timestamp of the post
  * @apiSuccess {timestamp} imported_at The imported at timestamp of the post
  *
  * @apiError (Error 500) InternalServerError There was an issue deleting the post
  */
module.exports = {
  method: 'DELETE',
  path: '/api/posts/{id}',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'posts.delete',
        data: { id: 'params.id' }
      }
    },
    validate: {
      params: { id: Joi.string().required() },
      query: { locked: Joi.boolean().default(false) }
    },
    pre: [
      { method: (request) => request.server.methods.auth.posts.delete(request.server, request.auth, request.params.id) },
      { method: 'auth.posts.lock(request.server, request.auth, request.params.id, query)' }
    ],
    handler: function(request, reply) {
      var promise = request.db.posts.delete(request)
      .tap(function() {
        if (request.query.locked) {
          return request.db.posts.lock(request);
        }
      })
      .error(request.errorMap.toHttpError);

      return promise;
    }
  }
};
