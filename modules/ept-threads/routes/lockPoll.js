var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {POST} /threads/:threadId/polls/:pollId/lock Lock Poll
  * @apiName LockPoll
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator, User
  * @apiDescription Used to lock a poll.
  *
  * @apiParam (Param) {string} id The unique id of the thread the poll is in.
  * @apiParam (Param) {string} id The unique id of the poll to lock.
  * @apiParam (Payload) {boolean} ids The value to set the poll's lock to.
  *
  * @apiSuccess {string} id The id of the poll
  * @apiSuccess {boolean} lockValue The value the poll's lock
  *
  * @apiError Unauthorized User doesn't have permissions to lock the poll
  * @apiError (Error 500) InternalServerError There was an issue locking in the poll
  */
module.exports = {
  method: 'POST',
  path: '/api/threads/{threadId}/polls/{pollId}/lock',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'threads.lockPoll',
        data: {
          thread_id: 'params.threadId',
          poll_id: 'params.pollId',
          locked: 'payload.lockValue'
        }
      }
    },
    validate: {
      params: {
        threadId: Joi.string().required(),
        pollId: Joi.string().required()
      },
      payload: { lockValue: Joi.boolean().required() }
    },
    pre: [ { method: 'auth.threads.lockPoll(server, auth, params.threadId)' } ]
  },
  handler: function(request, reply) {
    var pollId = request.params.pollId;
    var lockValue = request.payload.lockValue;

    var promise = request.db.polls.lock(pollId, lockValue);

    return reply(promise);
  }
};
