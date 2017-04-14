var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var Promise = require('bluebird');
var common = require(path.normalize(__dirname + '/../common'));

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {GET} /posts Page By Thread
  * @apiName PagePostsByThread
  * @apiDescription Used to page through posts by thread.
  *
  * @apiParam (Query) {string} thread_id Id of the thread to retrieve posts from
  * @apiParam (Query) {number} page Specific page of posts to retrieve. Do not use with start.
  * @apiParam (Query) {mixed} limit Number of posts to retrieve per page.
  * @apiParam (Query) {number} start Specific post within the thread. Do not use with page.
  *
  * @apiSuccess {array} posts Object containing posts for particular page, the thread these Posts
  * belong to, and the calculated page and limit constraints.
  *
  * @apiError (Error 500) InternalServerError There was an issue finding the posts for thread
  */
module.exports = {
  method: 'GET',
  path: '/api/posts',
  config: {
    app: { hook: 'posts.byThread' },
    auth: { mode: 'try', strategy: 'jwt' },
    validate: {
      query: Joi.object().keys({
        thread_id: Joi.string().required(),
        start: Joi.number().integer().min(1),
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100).default(25)
      }).without('start', 'page')
    },
    pre: [
      { method: 'auth.posts.byThread(server, auth, query.thread_id)', assign: 'viewables' },
      { method: 'hooks.preProcessing' },
      [
        { method: 'hooks.parallelProcessing', assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: 'hooks.merge' },
      { method: 'hooks.postProcessing' }
    ],
    handler: function(request, reply) {
      return reply(request.pre.processed);
    }
  }
};

function processing(request, reply) {
  // ready parameters
  var userId = '';
  var page = request.query.page;
  var start = request.query.start;
  var limit = request.query.limit;
  var threadId = request.query.thread_id;
  if (request.auth.isAuthenticated) { userId = request.auth.credentials.id; }
  var userPriority = request.server.plugins.acls.getUserPriority(request.auth);
  var viewables = request.pre.viewables;

  var opts = { limit: limit, start: 0, page: 1, userId: userId };
  if (start) { opts.page = Math.ceil(start / limit); }
  else if (page) { opts.page = page; }
  opts.start = ((opts.page * limit) - limit);

  // retrieve posts for this thread
  var getWriteAccess = request.db.threads.getBoardWriteAccess(threadId, userPriority);
  var getPosts = request.db.posts.byThread(threadId, opts);
  var getThread = request.db.threads.find(threadId);
  var getPoll = request.db.polls.byThread(threadId);
  var hasVoted = request.db.polls.hasVoted(threadId, userId);
  var getUserBoardBan = request.db.bans.isNotBannedFromBoard(userId, { threadId: threadId })
  .then((notBanned) => { return !notBanned || undefined; });

  var promise = Promise.join(getWriteAccess, getPosts, getThread, getPoll, hasVoted, getUserBoardBan, function(writeAccess, posts, thread, poll, voted, bannedFromBoard) {
    if (poll) {
      var hideVotes = poll.display_mode === 'voted' && !voted;
      hideVotes = hideVotes || (poll.display_mode === 'expired' && poll.expiration > Date.now());
      if (hideVotes) { poll.answers.map(function(answer) { answer.votes = 0; }); }
      poll.hasVoted = voted;
      thread.poll = poll;
    }

    return {
      thread: thread,
      bannedFromBoard: bannedFromBoard,
      writeAccess: writeAccess,
      limit: opts.limit,
      page: opts.page,
      posts: common.cleanPosts(posts, userId, viewables)
    };
  })
  // handle page or start out of range
  .then(function(ret) {
    var retVal = Boom.notFound();
    if (ret.posts.length > 0) { retVal = ret; }
    return retVal;
  })
  .error(request.errorMap.toHttpError);

  return reply(promise);
}
