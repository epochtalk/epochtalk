var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Threads
  * @api {POST} /threads/:thread_id/polls/:poll_id/lock Lock/Unlock Poll
  * @apiName LockPoll
  * @apiPermission Super Administrator, Administrator, Global Moderator, Moderator, User (Poll creator only)
  * @apiDescription Used to lock or unlock a poll.
  *
  * @apiParam {string} thread_id The unique id of the thread the poll is in.
  * @apiParam {string} poll_id The unique id of the poll to lock.
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
  path: '/api/threads/{thread_id}/polls/{poll_id}/lock',
  config: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'threads.lockPoll',
        data: {
          thread_id: 'params.thread_id',
          poll_id: 'params.poll_id',
          locked: 'payload.locked'
        }
      }
    },
    validate: {
      params: {
        thread_id: Joi.string().required(),
        poll_id: Joi.string().required()
      },
      payload: { locked: Joi.boolean().required() }
    },
    pre: [ { method: 'auth.threads.lockPoll(server, auth, params.thread_id)' } ]
  },
  handler: function(request, reply) {
    var pollId = request.params.poll_id;
    var locked = request.payload.locked;

    var promise = request.db.polls.lock(pollId, locked)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
