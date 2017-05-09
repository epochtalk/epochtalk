var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {POST} /threads/:threadId/polls/:pollId/vote Vote
  * @apiName VotePoll
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator, User
  * @apiDescription Used to vote in a poll.
  *
  * @apiParam {string} threadId The unique id of the thread the poll is in.
  * @apiParam {string} pollId The unique id of the poll to vote in.
  * @apiParam (Payload) {string[]} answer_ids The ids of the answers tied to the vote.
  *
  * @apiSuccess {string} id The unique id of the poll
  * @apiSuccess {string} question The question asked in the poll
  * @apiSuccess {object[]} answers The list of the answers to the question of this poll
  * @apiSuccess {string} answers.answer The answer to the question of this poll
  * @apiSuccess {string} answers.id The id of the answer
  * @apiSuccess {number} answers.votes The number of votes for this answer
  * @apiSuccess {number} max_answers The max number of answer per vote
  * @apiSuccess {boolean} has_voted Boolean indicating whether the user has voted
  * @apiSuccess {boolean} locked Boolean indicating whether the poll is locked
  * @apiSuccess {boolean} change_vote Boolean indicating whether users can change their vote
  * @apiSuccess {date} expiration The expiration date of the poll
  * @apiSuccess {string} display_mode String indicating how the results are shown to users
  *
  * @apiError (Error 401) Unauthorized User doesn't have permissions to vote in the poll
  * @apiError (Error 500) InternalServerError There was an issue voting in the poll
  */
module.exports = {
  method: 'POST',
  path: '/api/threads/{threadId}/polls/{pollId}/vote',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      params: {
        threadId: Joi.string().required(),
        pollId: Joi.string().required()
      },
      payload: { answer_ids: Joi.array().items(Joi.string()).min(1).unique().required() }
    },
    pre: [ { method: 'auth.threads.vote(server, auth, params, payload)' } ]
  },
  handler: function(request, reply) {
    var threadId = request.params.threadId;
    var answerIds = request.payload.answer_ids;
    var userId = request.auth.credentials.id;

    var promise = request.db.polls.vote(answerIds, userId)
    .then(function() {
      var getPoll = request.db.polls.byThread(threadId);
      var hasVoted = request.db.polls.hasVoted(threadId, userId);

      return Promise.join(getPoll, hasVoted, function(poll, voted) {
        var hideVotes = poll.display_mode === 'expired' && poll.expiration > Date.now();
        if (hideVotes) { poll.answers.map(function(answer) { answer.votes = 0; }); }
        poll.has_voted = voted;
        return poll;
      });
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
