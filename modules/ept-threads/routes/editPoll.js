var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {PUT} /threads/:thread_id/polls/:poll_id Edit Poll
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
  * @apiSuccess {string} id The unique id of the poll
  * @apiSuccess {number} max_answers The max number of answer per vote
  * @apiSuccess {boolean} change_vote Boolean indicating whether users can change their vote
  * @apiSuccess {date} expiration The expiration date of the poll
  * @apiSuccess {string} display_mode String indicating how the results are shown to users
  *
  * @apiError (Error 401) Unauthorized User doesn't have permissions to edit the poll
  * @apiError (Error 500) InternalServerError There was an issue editing the thread
  */
module.exports = {
  method: 'PUT',
  path: '/api/threads/{thread_id}/polls/{poll_id}',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'threads.editPoll',
        data: {
          thread_id: 'params.thread_id',
          poll_id: 'params.poll_id',
          poll_data: 'payload'
        }
      }
    },
    validate: {
      params: {
        thread_id: Joi.string().required(),
        poll_id: Joi.string().required()
      },
      payload: Joi.object().keys({
        max_answers: Joi.number().integer().min(1).required(),
        expiration: Joi.date(),
        change_vote: Joi.boolean().required(),
        display_mode: Joi.string().valid('always', 'voted', 'expired').required()
      })
    },
    pre: [ { method: 'auth.threads.editPoll(server, auth, params, request.payload)' } ]
  },
  handler: function(request, reply) {
    var options = request.payload;
    options.id = request.params.poll_id;
    var promise = request.db.polls.update(options)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
