var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {DELETE} /posts/:id/purge Purge
  * @apiName PurgePost
  * @apiPermission Admin
  * @apiDescription Used to purge a post.
  *
  * @apiParam {string} id The Id of the post to purge
  *
  * @apiUse PostObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue purging the post
  */
module.exports = {
  method: 'DELETE',
  path: '/api/posts/{id}/purge',
  config: {
    app: { post_id: 'params.id' },
    auth: { strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: 'auth.posts.purge(server, auth, params.id)' } ],
    handler: function(request, reply) {
      var promise = request.db.posts.purge(request.params.id)
      .error(request.errorMap.toHttpError);

      return reply(promise);
    }
  }
};
