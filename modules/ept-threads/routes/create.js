var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {POST} /threads Create
  * @apiName CreateThread
  * @apiPermission User
  * @apiDescription Used to create a new thread.
  *
  * @apiUse ThreadObjectPayload
  * @apiParam (Payload) {object} smf Object containing SMF metadata
  * @apiParam (Payload) {number} smf.ID_BOARD Legacy smf board id
  * @apiParam (Payload) {number} smf.ID_TOPIC Legacy smf thread id
  * @apiUse ThreadObjectSuccess
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
        raw_body: Joi.string().min(1).max(64000).required(),
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
      { method: 'auth.threads.create(server, auth, payload)' },
      { method: 'common.posts.clean(sanitizer, payload)' },
      { method: 'common.posts.parse(parser, payload)' },
      { method: 'common.images.sub(payload)' },
      { method: 'hooks.preProcessing' },
      [
        { method: 'hooks.parallelProcessing', assign: 'parallelProcessing' },
        { method: processing, assign: 'processed' }
      ],
      { method: 'hooks.merge' },
      { method: 'hooks.postProcessing' }
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
    raw_body: request.payload.raw_body,
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

  return reply(promise);
}

/**
  * @apiDefine ThreadObjectPayload
  * @apiParam (Payload) {string} title The title of the thread
  * @apiParam (Payload) {string} body The thread's body with any markup tags converted and parsed into html elements
  * @apiParam (Payload) {string} raw_body The thread's body as it was entered in the editor by the user
  * @apiParam (Payload) {string} board_id The unique id of the board this thread is being created within
  * @apiParam (Payload) {boolean} locked=false Boolean indicating whether the thread is locked or unlocked
  * @apiParam (Payload) {boolean} sticky=false Boolean indicating whether the thread is stickied or not
  */

/**
  * @apiDefine ThreadObjectSuccess
  * @apiSuccess {string} id The unqiue id of the post the thread is wrapping
  * @apiSuccess {string} thread_id The unqiue id of the thread
  * @apiSuccess {string} user_id The unique id of the user who created the thread
  * @apiSuccess {string} title The title of the thread
  * @apiSuccess {string} body The thread's body with any markup tags converted and parsed into html elements
  * @apiSuccess {string} raw_body The thread's body as it was entered in the editor by the user
  * @apiSuccess {timestamp} created_at Timestamp of when the thread was created
  */

/**
  * @apiDefine ThreadObjectSuccess2
  * @apiSuccess {string} id The unique id of the thread
  * @apiSuccess {string} board_id The unique id of the board the thread belongs to
  * @apiSuccess {string} title The title of the thread
  * @apiSuccess {boolean} locked Boolean indicating whether or not the thread is locked
  * @apiSuccess {boolean} sticky Boolean indicating whether or not the thread is stickied
  * @apiSuccess {number} post_count The number of posts this thread contains
  * @apiSuccess {object} user Object containing info about user who created the thread
  * @apiSuccess {string} user.id The unique id of the user who created the thread
  * @apiSuccess {string} user.username The username of the user who created the thread
  * @apiSuccess {timestamp} created_at Timestamp of when the thread was created
  * @apiSuccess {timestamp} updated_at Timestamp of when the thread was updated
  */

/**
  * @apiDefine ThreadObjectSuccess3
  * @apiSuccess {string} id The unique id of the poll
  * @apiSuccess {string} question The question asked in the poll
  * @apiSuccess {array} answers The list of the answers to the question of this poll
  * @apiSuccess {boolean} locked Boolean indicating whether the poll is locked
  * @apiSuccess {number} max_answers The max number of answer per vote
  * @apiSuccess {boolean} change_vote Boolean indicating whether users can change their vote
  * @apiSuccess {date} expiration The expiration date of the poll
  * @apiSuccess {string} display_mode String indicating how the results are shown to users
  * @apiSuccess {boolean} hasVoted Boolean indicating whether this user has voted
  */
