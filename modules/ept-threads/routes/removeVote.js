var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {DELETE} /threads/:thread_id/polls/:poll_id/vote Remove Vote
  * @apiName RemoveVotePoll
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator, User
  * @apiDescription Used to remove a vote in a poll.
  *
  * @apiParam {string} id The unique id of the thread the poll is in.
  * @apiParam {string} id The unique id of the poll to remove a vote from.
  *
  * @apiSuccess {string} id The unique id of the poll
  * @apiSuccess {string} question The question asked in the poll
  * @apiSuccess {object[]} answers The list of the answers to the question of this poll
  * @apiSuccess {string} answers.answer The answer to the question of this poll
  * @apiSuccess {string} answers.id The id of the answer
  * @apiSuccess {number} answers.votes The number of votes for this answer
  * @apiSuccess {number} max_answers The max number of answer per vote
  * @apiSuccess {boolean} has_voted Boolean indicating whether the user has voted
  * @apiSuccess {boolean} change_vote Boolean indicating whether users can change their vote
  * @apiSuccess {date} expiration The expiration date of the poll
  * @apiSuccess {string} display_mode String indicating how the results are shown to users
  *
  * @apiError (Error 401) Unauthorized User doesn't have permissions to vote in the poll
  * @apiError (Error 500) InternalServerError There was an issue removing a vote in the poll
  */
module.exports = {
  method: 'DELETE',
  path: '/api/threads/{thread_id}/polls/{poll_id}/vote',
  options: {
    auth: { strategy: 'jwt' },
    validate: {
      params: {
        thread_id: Joi.string().required(),
        poll_id: Joi.string().required()
      }
    },
    pre: [ { method: (request) => request.server.methods.auth.threads.removeVote(request.server, request.auth, request.params.thread_id, request.params.poll_id) } ]
  },
  handler: function(request) {
    var threadId = request.params.thread_id;
    var pollId = request.params.poll_id;
    var userId = request.auth.credentials.id;

    var promise = request.db.polls.removeVote(pollId, userId)
    .then(function() {
      var getPoll = request.db.polls.byThread(threadId);
      var hasVoted = request.db.polls.hasVoted(threadId, userId);

      return Promise.join(getPoll, hasVoted, function(poll, voted) {
        var hideVotes = poll.display_mode === 'voted' && !voted;
        hideVotes = hideVotes || (poll.display_mode === 'expired' && poll.expiration > Date.now());
        if (hideVotes) { poll.answers.map(function(answer) { answer.votes = 0; }); }
        poll.has_voted = voted;
        return poll;
      });
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
