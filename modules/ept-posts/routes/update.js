var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {POST} /posts/:id Update
  * @apiName UpdatePost
  * @apiPermission User (Post's Author) or Admin
  * @apiDescription Used to update a post.
  *
  * @apiParam {string} id The unique id of the post being updated
  * @apiUse PostObjectPayload
  *
  * @apiUse PostObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue updating the post
  */
module.exports = {
  method: 'POST',
  path: '/api/posts/{id}',
  config: {
    app: { hook: 'posts.update' },
    auth: { strategy: 'jwt' },
    validate: {
      payload: {
        title: Joi.string().min(1).max(255).required(),
        raw_body: Joi.string().min(1).max(64000).required(),
        thread_id: Joi.string().required()
      },
      params: { id: Joi.string().required() }
    },
    pre: [
      { method: 'auth.posts.update(server, auth, params.id, payload.thread_id)' },
      { method: 'common.posts.clean(sanitizer, payload)' },
      { method: 'common.posts.parse(parser, payload)' },
      { method: 'common.images.sub(payload)' },
      { method: 'common.posts.newbieImages(auth, payload)' },
      { method: 'hooks.preProcessing' },
      [
        { method: 'hooks.parallelProcessing', assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: 'hooks.merge' },
      { method: 'hooks.postProcessing' }
    ],
    handler: function(request, reply) {
      return reply(request.pre.processed);
    }
  }
};

function processing(request, reply) {
  var updatePost = request.payload;
  updatePost.id = request.params.id;
  var promise = request.db.posts.update(updatePost)
  // handle image references
  .then((post) => { return request.imageStore.updateImageReferences(post); })
  .error(request.errorMap.toHttpError);

  return reply(promise);
}
