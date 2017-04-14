var Joi = require('joi');
var Promise = require('bluebird');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {DELETE} /threads/:threadId/polls/:pollId/vote Remove Vote
  * @apiName RemoveVotePoll
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator, User
  * @apiDescription Used to remove a vote in a poll.
  *
  * @apiParam (Param) {string} id The unique id of the thread the poll is in.
  * @apiParam (Param) {string} id The unique id of the poll to remove a vote from.
  *
  * @apiUse ThreadObjectSuccess3
  *
  * @apiError Unauthorized User doesn't have permissions to vote in the poll
  * @apiError (Error 500) InternalServerError There was an issue removing a vote in the poll
  */
module.exports = {
  method: 'DELETE',
  path: '/api/threads/{threadId}/polls/{pollId}/vote',
  config: {
    auth: { strategy: 'jwt' },
    validate: {
      params: {
        threadId: Joi.string().required(),
        pollId: Joi.string().required()
      }
    },
    pre: [ { method: 'auth.threads.removeVote(server, auth, params.threadId, params.pollId)' } ]
  },
  handler: function(request, reply) {
    var threadId = request.params.threadId;
    var pollId = request.params.pollId;
    var userId = request.auth.credentials.id;

    var promise = request.db.polls.removeVote(pollId, userId)
    .then(function() {
      var getPoll = request.db.polls.byThread(threadId);
      var hasVoted = request.db.polls.hasVoted(threadId, userId);

      return Promise.join(getPoll, hasVoted, function(poll, voted) {
        var hideVotes = poll.display_mode === 'voted' && !voted;
        hideVotes = hideVotes || (poll.display_mode === 'expired' && poll.expiration > Date.now());
        if (hideVotes) { poll.answers.map(function(answer) { answer.votes = 0; }); }
        poll.hasVoted = voted;
        return poll;
      });
    })
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
