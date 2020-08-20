var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {GET} /threads/:slug/id Convert Thread Slug to Id
  * @apiName SlugToThreadId
  * @apiDescription Used to retrieve a threads id via is slug.
  *
  * @apiParam {string} slug The slug of the thread
  *
  * @apiSuccess {string} id The unqiue id of the thread
  *
  * @apiError (Error 500) InternalServerError There was an issue find a thread with the provided slug
  */
module.exports = {
  method: 'GET',
  path: '/api/threads/{slug}/id',
  options: {
    app: { hook: 'threads.slugToThreadId' },
    validate: { params: Joi.object({ slug: Joi.string().regex(/^[a-zA-Z0-9-~!@)(_+:'"\.](-?[a-zA-Z0-9-~!@)(_+:'"\.])*$/).min(1).max(100).required() }) }
  },
  handler: function(request) {
    var slug = request.params.slug;

    // create the thread
    var promise = request.db.threads.slugToThreadId(slug)
    .then(function(threadId) { return { id: threadId}; })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
