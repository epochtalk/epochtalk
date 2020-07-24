var Joi = require('@hapi/joi');
var path = require('path');

/**
  * @apiVersion 0.4.0
  * @apiGroup Messages
  * @api {PUT} /messages/drafts Save Message Draft
  * @apiName SaveMessageDraft
  * @apiDescription Used to save a user's message draft.
  *
  * @apiSuccess {string} user_id The id of the user
  * @apiSuccess {string} draft The user's message draft
  * @apiSuccess {timestamp} updated_at The updated at timestamp of the draft
  *
  * @apiError (Error 500) InternalServerError There was an issue saving the message draft
  */
module.exports = {
  method: 'PUT',
  path: '/api/messages/draft',
  options: {
    app: { hook: 'messages.updateMessageDraft' },
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
  // update message draft
  var userId = '';
  var authenticated = request.auth.isAuthenticated;
  if (authenticated) { userId = request.auth.credentials.id; }
  var promise = request.db.messages.updateMessageDraft(userId, request.payload.draft)
  .error(request.errorMap.toHttpError);

  return promise;
}
