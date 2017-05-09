var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {POST} /threads/:threadId/polls/:pollId/lock Lock/Unlock Poll
  * @apiName LockPoll
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator, User (Poll creator only)
  * @apiDescription Used to lock or unlock a poll.
  *
  * @apiParam {string} threadId The unique id of the thread the poll is in.
  * @apiParam {string} pollId The unique id of the poll to lock.
  * @apiParam (Payload) {boolean} locked Boolean indicating to lock or unlock the poll
  *
  * @apiSuccess {string} id The id of the poll
  * @apiSuccess {boolean} locked The value the poll's lock
  *
  * @apiError (Error 401) Unauthorized User doesn't have permissions to lock the poll
  * @apiError (Error 500) InternalServerError There was an issue locking/unlocking the poll
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
          locked: 'payload.locked'
        }
      }
    },
    validate: {
      params: {
        threadId: Joi.string().required(),
        pollId: Joi.string().required()
      },
      payload: { locked: Joi.boolean().required() }
    },
    pre: [ { method: 'auth.threads.lockPoll(server, auth, params.threadId)' } ]
  },
  handler: function(request, reply) {
    var pollId = request.params.pollId;
    var locked = request.payload.locked;

    var promise = request.db.polls.lock(pollId, locked)
    .error(request.errorMap.toHttpError);

    return reply(promise);
  }
};
