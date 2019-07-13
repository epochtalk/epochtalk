var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {POST} /posts Create
  * @apiName CreatePost
  * @apiPermission User
  * @apiDescription Used to create a new post.
  *
  * @apiUse PostObjectPayload
  * @apiUse PostObjectSuccess
  *
  * @apiError (Error 500) InternalServerError There was an issue creating the post
*/
module.exports = {
  method: 'POST',
  path: '/api/posts',
  config: {
    app: { hook: 'posts.create' },
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: {
      payload: Joi.object().keys({
        title: Joi.string().min(1).max(255).required(),
        body: Joi.string().min(1).max(64000).required(),
        thread_id: Joi.string().required()
      })
    },
    pre: [
      { method: 'auth.posts.create(server, auth, request.payload.thread_id)' },
      { method: 'common.posts.checkPostLength(server, request.payload.body)' },
      { method: 'common.posts.clean(request.sanitizer, request.payload)' },
      { method: 'common.posts.parse(parser, request.payload)' },
      { method: 'common.images.sub(request.payload)' },
      { method: 'common.posts.newbieImages(auth, request.payload)' },
      { method: (request) => request.server.methods.hooks.preProcessing },
      [
        { method: (request) => request.server.methods.hooks.parallelProcessing, assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: (request) => request.server.methods.hooks.merge },
      { method: (request) => request.server.methods.hooks.postProcessing }
    ],
    handler: function(request, reply) {
      return reply(request.pre.processed);
    }
  }
};


function processing(request, reply) {
  // build the post object from payload and params
  var newPost = request.payload;
  newPost.user_id = request.auth.credentials.id;

  // create the post in db
  var promise = request.db.posts.create(newPost)
  // handle any image references
  .then((post) => { return request.imageStore.createImageReferences(post); })
  .error(request.errorMap.toHttpError);

  return promise;
}


/**
  * @apiDefine PostObjectPayload
  * @apiParam (Payload) {string} title The title of the post
  * @apiParam (Payload) {string} body The post's body as it was entered in the editor by the user
  * @apiParam (Payload) {string} thread_id The unique id of the thread the post belongs to
  */

/**
  * @apiDefine PostObjectSuccess
  * @apiSuccess {string} id The unique id of the post
  * @apiSuccess {string} thread_id The unique id of the thread the post belongs to
  * @apiSuccess {string} user_id The unique id of the user who created the post
  * @apiSuccess {string} title The title of the post
  * @apiSuccess {string} body_html The post's body with any markup tags converted and parsed into html elements
  * @apiSuccess {boolean} deleted boolean indicating if post has been deleted
  * @apiSuccess {boolean} locked boolean indicating if post has been locked
  * @apiSuccess {string} body The post's body as it was entered in the editor by the user
  * @apiSuccess {timestamp} created_at Timestamp of when the post was created
  */
