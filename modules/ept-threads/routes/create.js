var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {POST} /threads Create
  * @apiName CreateThread
  * @apiPermission User
  * @apiDescription Used to create a new thread.
  *
  * @apiParam (Payload) {string} title The title of the thread
  * @apiParam (Payload) {string} body The thread's body as it was entered in the editor by the user
  * @apiParam (Payload) {string} board_id The unique id of the board this thread is being created within
  * @apiParam (Payload) {boolean} [locked=false] Boolean indicating whether the thread is locked or unlocked
  * @apiParam (Payload) {boolean} [sticky=false] Boolean indicating whether the thread is stickied or not
  * @apiParam (Payload) {boolean} [moderated=false] Boolean indicating whether the thread is self-moderated or not
  * @apiParam (Payload) {object} poll Object containing poll data
  * @apiParam (Payload) {number} [poll.max_answers=1] The max answers allowed for poll
  * @apiParam (Payload) {timestamp} [poll.expiration] Timestamp of when the poll expires
  * @apiParam (Payload) {boolean} [poll.change_vote=false] Boolean indicating if you can change your vote
  * @apiParam (Payload) {string="always", "voted", "expired"} poll.display_mode Used for the UI display mode of the poll
  * @apiParam (Payload) {string[]} questions An array of poll questions
  * @apiParam (Payload) {string[]} answers An array of poll answers
  *
  * @apiSuccess {string} id The unqiue id of the post the thread is wrapping
  * @apiSuccess {string} thread_id The unqiue id of the thread
  * @apiSuccess {string} user_id The unique id of the user who created the thread
  * @apiSuccess {string} title The title of the thread
  * @apiSuccess {boolean} deleted Boolean indicating if the thread has been deleted
  * @apiSuccess {boolean} locked Boolean indicating if the thread has been locked
  * @apiSuccess {string} body_html The thread's body with any markup tags converted and parsed into html elements
  * @apiSuccess {string} body The thread's body as it was entered in the editor by the user
  * @apiSuccess {timestamp} created_at Timestamp of when the thread was created
  *
  * @apiError (Error 500) InternalServerError There was an issue creating the thread
  */
module.exports = {
  method: 'POST',
  path: '/api/threads',
  config: {
    app: { hook: 'threads.create' },
    auth: { strategy: 'jwt' },
    validate: {
      payload: Joi.object().keys({
        locked: Joi.boolean().default(false),
        sticky: Joi.boolean().default(false),
        moderated: Joi.boolean().default(false),
        title: Joi.string().min(1).max(255).required(),
        body: Joi.string().min(1).max(64000).required(),
        board_id: Joi.string().required(),
        poll: Joi.object().keys({
          max_answers: Joi.number().integer().min(1).default(1),
          expiration: Joi.date().min('now'),
          change_vote: Joi.boolean().default(false),
          display_mode: Joi.string().valid('always', 'voted', 'expired').required(),
          question: Joi.string().min(1).max(255).required(),
          answers: Joi.array().items(Joi.string()).min(1).max(255).required()
        })
      })
    },
    pre: [
      { method: 'auth.threads.create(request.server, request.auth, request.payload)' },
      { method: 'common.posts.clean(request.sanitizer, request.payload)' },
      { method: 'common.posts.parse(parser, request.payload)' },
      { method: 'common.images.sub(request.payload)' },
      { method: (request) => request.server.methods.hooks.preProcessing },
      [
        { method: (request) => request.server.methods.hooks.parallelProcessing, assign: 'parallelProcessing' },
        { method: processing, assign: 'processed' }
      ],
      { method: (request) => request.server.methods.hooks.merge },
      { method: (request) => request.server.methods.hooks.postProcessing }
    ]
  },
  handler: function(request, reply) {
    return reply(request.pre.processed);
  }
};

function processing(request, reply) {
  // build the thread post object from payload and params
  var user = request.auth.credentials;
  var newThread = {
    board_id: request.payload.board_id,
    locked: request.payload.locked,
    sticky: request.payload.sticky,
    moderated: request.payload.moderated
  };
  var newPost = {
    title: request.payload.title,
    body: request.payload.body,
    user_id: user.id
  };

  // create the thread
  var promise = request.db.threads.create(newThread)
  // save thread id to newPost
  .tap(function(thread) { newPost.thread_id = thread.id; })
  // create any associated polls
  .then(function(thread) {
    if (request.payload.poll) {
      return request.db.polls.create(thread.id, request.payload.poll);
    }
  })
  // create the first post in this thread
  .then(function() { return request.db.posts.create(newPost); })
  .error(request.errorMap.toHttpError);

  return promise;
}
