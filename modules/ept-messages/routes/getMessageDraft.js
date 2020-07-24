var Joi = require('@hapi/joi');
var path = require('path');

/**
  * @apiVersion 0.4.0
  * @apiGroup Messages
  * @api {GET} /messages/drafts Get Message Draft
  * @apiName GetMessageDraft
  * @apiDescription Used to find a user's message draft.
  *
  * @apiSuccess {string} user_id The id of the user
  * @apiSuccess {string} draft The user's latest draft
  * @apiSuccess {timestamp} updated_at The updated at timestamp of the draft
  *
  * @apiError (Error 500) InternalServerError There was an issue finding the message draft
  */
module.exports = {
  method: 'GET',
  path: '/api/messages/draft',
  options: {
    app: { hook: 'messages.getMessageDraft' },
    auth: { strategy: 'jwt' },
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
  // retrieve message draft
  var userId = '';
  var authenticated = request.auth.isAuthenticated;
  if (authenticated) { userId = request.auth.credentials.id; }
  var promise = request.db.messages.getMessageDraft(userId)
  .error(request.errorMap.toHttpError);

  return promise;
}
