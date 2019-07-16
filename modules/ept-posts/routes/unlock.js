var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {POST} /posts/:id/unlock Unlock
  * @apiName UnlockPost
  * @apiPermission Admin or Mod
  * @apiDescription Used to unlock a post.
  *
  * @apiParam {string} id The Id of the post to unlock
  *
  * @apiUse PostObjectSuccess
  * @apiSuccess {number} position The position of the post within the thread
  * @apiSuccess {timestamp} updated_at The updated at timestamp of the post
  * @apiSuccess {timestamp} imported_at The imported at timestamp of the post
  *
  * @apiError (Error 400) BadRequest Post Not Found
  * @apiError (Error 500) InternalServerError There was an issue deleting the post
  */
module.exports = {
  method: 'POST',
  path: '/api/posts/{id}/unlock',
  config: {
    auth: { strategy: 'jwt' },
    validate: { params: { id: Joi.string().required() } },
    pre: [ { method: (request) => request.server.methods.auth.posts.lock(request.server, request.auth, request.params.id)} ],
    handler: function(request, reply) {
      var promise = request.db.posts.unlock(request.params.id)
      .error(request.errorMap.toHttpError);

      return promise;
    }
  }
};
