var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Mentions
  * @api {GET} /mentions View Mentions
  * @apiName GetMentions
  * @apiPermission User
  * @apiDescription Used to view a user's mentions
  *
  * @apiParam (Query) {number} [page] The page of mentions to return
  * @apiParam (Query) {number} [limit] The number mentions to return per page
  * @apiParam (Query) {boolean} [extended] Brings back extra data such as parts of the post body, board name, board id, etc...
  *
  * @apiSuccess {number} page The page of mentions being returned
  * @apiSuccess {number} limit The number mentions being returned per page
  * @apiSuccess {boolean} prev Boolean indicating if there is a previous page
  * @apiSuccess {boolean} next Boolean indicating if there is a next page
  * @apiSuccess {boolean} extended Boolean indicating if extra metadata should be returned
  * @apiSuccess {object[]} data Array containing mention objects
  * @apiSuccess {string} data.id The id of the mention
  * @apiSuccess {string} data.thread_id The id of the thread the mention is in
  * @apiSuccess {string} data.title The title of the thread the mention is in
  * @apiSuccess {string} data.post_id The id of the post the mention is in
  * @apiSuccess {number} data.post_start The start position of the post in the thread
  * @apiSuccess {string} data.mentioner The username of the mentioner
  * @apiSuccess {string} data.mentioner_avatar The avatar of the mentioner
  * @apiSuccess {string} data.notification_id The id of the notification (for websockets)
  * @apiSuccess {boolean} data.viewed Boolean indicating if the mention has been viewed
  * @apiSuccess {timestamp} data.created_at Timestamp of when the mention was created
  * @apiSuccess {string} data.board_id The id of the board the mention is in (If extended=true)
  * @apiSuccess {string} data.board_name The name of the board the mentions is in(If extended=true)
  * @apiSuccess {string} data.body_html The body of the post the mention is in (If extended=true)
  * @apiSuccess {string} data.body The unprocess body of the post the mention is in (If extended=true)
  *
  * @apiError (Error 500) InternalServerError There was an error paging user mentions
  */
module.exports = {
  method: 'GET',
  path: '/api/mentions',
  options: {
    app: { hook: 'mentions.page' },
    auth: { strategy: 'jwt' },
    plugins: { track_ip: true },
    validate: {
      query: {
        limit: Joi.number(),
        page: Joi.number(),
        extended: Joi.boolean()
      }
    },
    pre: [
      { method: (request) => request.server.methods.auth.mentions.page(request.server, request.auth) },
      { method: (request) => request.server.methods.hooks.preProcessing(request) },
      [
        { method: (request) => request.server.methods.hooks.parallelProcessing(request), assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: (request) => request.server.methods.hooks.merge(request) },
      { method: (request) => request.server.methods.common.posts.parseOut(request.parser, request.pre.processed.data) },
      { method: (request) => request.server.methods.hooks.postProcessing(request) }
    ]
  },
  handler: function(request) {
    return request.pre.processed;
  }
};

function processing(request) {
  var mentioneeId = request.auth.credentials.id;
  var opts = {
    limit: request.query.limit,
    page: request.query.page,
    extended: request.query.extended
  };
  var promise = request.db.mentions.page(mentioneeId, opts)
  .error(request.errorMap.toHttpError);

  return promise;
}
