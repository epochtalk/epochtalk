var Joi = require('@hapi/joi');
var path = require('path');

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {PUT} /posts/drafts Save Post Draft
  * @apiName SavePostDraft
  * @apiDescription Used to save a user's post draft.
  *
  * @apiSuccess {string} user_id The id of the user
  * @apiSuccess {string} draft The user's post draft
  * @apiSuccess {timestamp} updated_at The updated at timestamp of the draft
  *
  * @apiError (Error 500) InternalServerError There was an issue saving the post draft
  */
module.exports = {
  method: 'PUT',
  path: '/api/posts/draft',
  options: {
    app: { hook: 'posts.updatePostDraft' },
    auth: { strategy: 'jwt' },
    validate: {
      payload: Joi.object({
        draft: Joi.string().min(1).max(64000).required().allow(null)
      }),
    },
    pre: [
      { method: (request) => request.server.methods.hooks.preProcessing(request) },
      [
        { method: (request) => request.server.methods.hooks.parallelProcessing(request), assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: (request) => request.server.methods.hooks.merge(request) },
      { method: (request) => request.server.methods.hooks.postProcessing(request) }
    ],
    handler: function(request) {
      return request.pre.processed;
    }
  }
};

function processing(request) {
  // update post draft
  var userId = '';
  var authenticated = request.auth.isAuthenticated;
  if (authenticated) { userId = request.auth.credentials.id; }
  var promise = request.db.posts.updatePostDraft(userId, request.payload.draft)
  .error(request.errorMap.toHttpError);

  return promise;
}
