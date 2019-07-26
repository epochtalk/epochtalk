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
  * @apiSuccess {string} id The unique id of the post
  * @apiSuccess {string} thread_id The unique id of the thread the post belongs to
  * @apiSuccess {string} user_id The unique id of the user who created the post
  * @apiSuccess {string} title The title of the post
  * @apiSuccess {string} body_html The post's body with any markup tags converted and parsed into html elements
  * @apiSuccess {string} body The post's body as it was entered in the editor by the user
  * @apiSuccess {timestamp} updated_at Timestamp of when the post was updated
  *
  * @apiError (Error 500) InternalServerError There was an issue updating the post
  */
module.exports = {
  method: 'POST',
  path: '/api/posts/{id}',
  config: {
    app: { hook: 'posts.update' },
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'posts.update',
        data: { id: 'params.id' }
      }
    },
    validate: {
      payload: {
        title: Joi.string().min(1).max(255).required(),
        body: Joi.string().min(1).max(64000).required(),
        thread_id: Joi.string().required()
      },
      params: { id: Joi.string().required() }
    },
    pre: [
      { method: (request) => request.server.methods.auth.posts.update(request.server, request.auth, request.params.id, request.payload.thread_id) },
      { method: (request) => request.server.methods.common.posts.clean(request.sanitizer, request.payload) },
      { method: (request) => request.server.methods.common.posts.parse(request.parser, request.payload) },
      { method: (request) => request.server.methods.common.images.sub(request.payload) },
      { method: (request) => request.server.methods.common.posts.newbieImages(request.auth, request.payload) },
      { method: (request) => request.server.methods.hooks.preProcessing(request) },
      [
        { method: (request) => request.server.methods.hooks.parallelProcessing(request), assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: (request) => request.server.methods.hooks.merge(request) },
      { method: (request) => request.server.methods.common.posts.parseOut(request.parser, request.pre.processed) },
      { method: (request) => request.server.methods.hooks.postProcessing(request) }
    ],
    handler: function(request, reply) {
      return request.pre.processed;
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

  return promise;
}
