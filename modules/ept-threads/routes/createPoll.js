var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {POST} /threads/:threadId/polls Create Poll
  * @apiName CreatePoll
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator, User (that created the thread)
  * @apiDescription Used to create a poll.
  *
  * @apiParam (Param) {string} thread_id The unique id of the thread the poll is in.
  * @apiParam (Param) {string} question The question asked in the poll.
  * @apiParam (Param) {string[]} answers The list of the answers to the question of this poll.
  * @apiParam (Payload) {number} [max_answers=1] The max number of answers per vote.
  * @apiParam (Payload) {date} [expiration] The expiration date of the poll.
  * @apiParam (Payload) {boolean} [change_vote] Boolean indicating whether users can change their vote.
  * @apiParam (Payload) {string="always", "voted", "expired"} display_mode String indicating how the results are shown to users.
  *
  * @apiSuccess {string} id The unique id of the poll
  * @apiSuccess {string} question The question asked in the poll
  * @apiSuccess {object[]} answers The list of the answers to the question of this poll
  * @apiSuccess {string} answers.answer The answer to the question of this poll
  * @apiSuccess {number} max_answers The max number of answer per vote
  * @apiSuccess {boolean} change_vote Boolean indicating whether users can change their vote
  * @apiSuccess {date} expiration The expiration date of the poll
  * @apiSuccess {string} display_mode String indicating how the results are shown to users
  *
  * @apiError (Error 401) Unauthorized User doesn't have permissions to create the poll
  * @apiError (Error 500) InternalServerError There was an issue creating the thread
  */
module.exports = {
  method: 'POST',
  path: '/api/threads/{threadId}/polls',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'threads.createPoll',
        data: {
          thread_id: 'params.threadId',
          poll_data: 'payload'
        }
      }
    },
    validate: {
      params: { threadId: Joi.string().required() },
      payload: Joi.object().keys({
        question: Joi.string().min(1).max(255).required(),
        answers: Joi.array().items(Joi.string()).min(1).max(255).required(),
        max_answers: Joi.number().integer().min(1).default(1),
        expiration: Joi.date().min('now'),
        change_vote: Joi.boolean().default(false),
        display_mode: Joi.string().valid('always', 'voted', 'expired').required()
      })
    },
    pre: [ { method: 'auth.threads.createPoll(server, auth, params.threadId, payload)' } ]
  },
  handler: function(request, reply) {
    var threadId = request.params.threadId;
    var poll = request.payload;

    var promise = request.db.polls.create(threadId, poll)
    .then(function(dbPoll) {
      poll.id = dbPoll.id;
      poll.answers = poll.answers.map(function(answer) { return { answer: answer }; });
      return poll;
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
