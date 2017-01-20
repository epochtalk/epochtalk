var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {PUT} /threads/:threadId/polls/:pollId Edit Poll
  * @apiName EditPoll
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator, User (that created the poll)
  * @apiDescription Used to edit a poll.
  *
  * @apiParam (Param) {string} thread_id The unique id of the thread the poll is in.
  * @apiParam (Param) {string} poll_id The unique id of the poll to vote in.
  * @apiParam (Payload) {number} max_answers The max number of answers per vote.
  * @apiParam (Payload) {date} expiration The expiration date of the poll.
  * @apiParam (Payload) {boolean} change_vote Boolean indicating whether users can change their vote.
  * @apiParam (Payload) {string} display_mode String indicating how the results are shown to users.
  *
  * @apiUse ThreadObjectSuccess3
  *
  * @apiError Unauthorized User doesn't have permissions to edit the poll
  * @apiError (Error 500) InternalServerError There was an issue editing the thread
  */
module.exports = {
  method: 'PUT',
  path: '/api/threads/{threadId}/polls/{pollId}',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'threads.editPoll',
        data: {
          thread_id: 'params.threadId',
          poll_id: 'params.pollId',
          poll_data: 'payload'
        }
      }
    },
    validate: {
      params: {
        threadId: Joi.string().required(),
        pollId: Joi.string().required()
      },
      payload: Joi.object().keys({
        max_answers: Joi.number().integer().min(1).required(),
        expiration: Joi.date(),
        change_vote: Joi.boolean().required(),
        display_mode: Joi.string().valid('always', 'voted', 'expired').required()
      })
    },
    pre: [ { method: 'auth.threads.editPoll(server, auth, params, payload)' } ]
  },
  handler: function(request, reply) {
    var options = request.payload;
    options.id = request.params.pollId;
    var promise = request.db.polls.update(options);
    return reply(promise);
  }
};
