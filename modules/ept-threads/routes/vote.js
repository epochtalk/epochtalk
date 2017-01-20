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
  * @apiParam (Param) {string} id The unique id of the thread the poll is in.
  * @apiParam (Param) {string} id The unique id of the poll to vote in.
  * @apiParam (Payload) {array} ids The ids of the answer tied to the vote.
  *
  * @apiUse ThreadObjectSuccess3
  *
  * @apiError Unauthorized User doesn't have permissions to vote in the poll
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
      payload: { answerIds: Joi.array().items(Joi.string()).min(1).unique().required() }
    },
    pre: [ { method: 'auth.threads.vote(server, auth, params, payload)' } ]
  },
  handler: function(request, reply) {
    var threadId = request.params.threadId;
    var answerIds = request.payload.answerIds;
    var userId = request.auth.credentials.id;

    var promise = request.db.polls.vote(answerIds, userId)
    .then(function() {
      var getPoll = request.db.polls.byThread(threadId);
      var hasVoted = request.db.polls.hasVoted(threadId, userId);

      return Promise.join(getPoll, hasVoted, function(poll, voted) {
        var hideVotes = poll.display_mode === 'expired' && poll.expiration > Date.now();
        if (hideVotes) { poll.answers.map(function(answer) { answer.votes = 0; }); }
        poll.hasVoted = voted;
        return poll;
      });
    });

    return reply(promise);
  }
};
