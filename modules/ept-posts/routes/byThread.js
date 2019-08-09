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
  * @apiParam (Query) {number} page Specific page of posts to retrieve. Only valid when start param is not present.
  * @apiParam (Query) {number} limit Number of posts to retrieve per page.
  * @apiParam (Query) {number} start Specific post within the thread. Only valid when page param is not present.
  *
  * @apiSuccess {boolean} write_access Boolean indicating if user has write access to thread
  * @apiSuccess {boolean} banned_from_board Boolean indicating if user is banned from this board
  * @apiSuccess {number} page The page of posts being returned
  * @apiSuccess {number} limit The number of posts per page being returned
  * @apiSuccess {object} thread Object containing thread metadata
  * @apiSuccess {string} thread.id The id of the thread
  * @apiSuccess {string} thread.board_id The id of the board the thread is in
  * @apiSuccess {boolean} thread.locked Boolean indicating if thread is locked
  * @apiSuccess {boolean} thread.sticky Boolean indicating if thread is stickied
  * @apiSuccess {boolean} thread.moderated Boolean indicating if thread is self moderated
  * @apiSuccess {boolean} thread.watched Boolean indicating if thread is being watched
  * @apiSuccess {boolean} thread.trust_visible Boolean indicating if trust score is visible
  * @apiSuccess {number} thread.post_count Number of posts in the thread
  * @apiSuccess {timestamp} thread.created_at Thread created at timestamp
  * @apiSuccess {timestamp} thread.updated_at Thread updated at timestamp
  * @apiSuccess {object} thread.user The user who started the thread
  * @apiSuccess {string} thread.user.id The id of the user who started the thread
  * @apiSuccess {string} thread.user.username The username of the user who started the thread
  * @apiSuccess {boolean} thread.user.deleted Boolean indicating if the thread started has had their account deleted
  * @apiSuccess {object} thread.poll Object that contains poll data, if thread has a poll
  * @apiSuccess {string} thread.poll.id The unique id of the poll
  * @apiSuccess {string} thread.poll.question The question asked in the poll
  * @apiSuccess {object[]} thread.poll.answers The list of the answers to the question of this poll
  * @apiSuccess {string} thread.poll.answers.answer The answer to the question of this poll
  * @apiSuccess {number} thread.poll.max_answers The max number of answer per vote
  * @apiSuccess {boolean} thread.poll.change_vote Boolean indicating whether users can change their vote
  * @apiSuccess {boolean} thread.poll.locked Boolean indicating whether the poll is locked or not
  * @apiSuccess {boolean} thread.poll.has_voted Boolean indicating whether or not the user has voted
  * @apiSuccess {date} thread.poll.expiration The expiration date of the poll
  * @apiSuccess {string} thread.poll.display_mode String indicating how the results are shown to users
  *
  * @apiSuccess {object[]} posts Object containing thread posts
  * @apiSuccess {string} posts.id The id of the post
  * @apiSuccess {number} posts.position The position of the post in the thread
  * @apiSuccess {string} posts.thread_id The id of the thread containing the post
  * @apiSuccess {string} posts.board_id The id of the board containing the post
  * @apiSuccess {string} posts.title The title of the post
  * @apiSuccess {string} posts.body_html The processed body of the post
  * @apiSuccess {string} posts.body The unprocessed body of the post
  * @apiSuccess {boolean} posts.locked Boolean indicating if the thread is locked
  * @apiSuccess {boolean} posts.reported Boolean indicating if the post has been reported by the authorized user
  * @apiSuccess {boolean} posts.reported_author Boolean indicating if the post's author has been reported by the authorized user
  * @apiSuccess {timestamp} posts.created_at The created at timestamp of the post
  * @apiSuccess {timestamp} posts.updated_at The updated at timestamp of the post
  * @apiSuccess {timestamp} posts.imported_at The imported at timestamp of the post
  * @apiSuccess {string} posts.avatar The avatar of the user who made the post
  * @apiSuccess {object} posts.user Object containing user data about the author of the post
  * @apiSuccess {string} posts.user.id The id of the user
  * @apiSuccess {string} posts.user.name The name of the user
  * @apiSuccess {string} posts.user.username The username of the user
  * @apiSuccess {number} posts.user.priority The priority of the user
  * @apiSuccess {string} posts.user.signature The signature of the user
  * @apiSuccess {string} posts.user.highlight_color The role highlight color of the user
  * @apiSuccess {string} posts.user.role_name The role name of the user
  * @apiSuccess {number} posts.user.activity The user's activity number
  * @apiSuccess {number} posts.user.post_count The user's post count number
  * @apiSuccess {object} posts.user.stats Object containing trust stats for user
  * @apiSuccess {number} posts.user.stats.score The user's overall trust score
  * @apiSuccess {number} posts.user.stats.neg The user's negative trust points
  * @apiSuccess {number} posts.user.stats.pos The user's positive trust points
  *
  * @apiError (Error 500) InternalServerError There was an issue finding the posts for thread
  */
module.exports = {
  method: 'GET',
  path: '/api/posts',
  options: {
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
      { method: (request) => request.server.methods.auth.posts.byThread(request.server, request.auth, request.query.thread_id), assign: 'viewables' },
      { method: (request) => request.server.methods.hooks.preProcessing(request) },
      [
        { method: (request) => request.server.methods.hooks.parallelProcessing(request), assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: (request) => request.server.methods.hooks.merge(request) },
      { method: (request) => request.server.methods.common.posts.parseOut(request.parser, request.pre.processed.posts) },
      { method: (request) => request.server.methods.hooks.postProcessing(request) }
    ],
    handler: function(request) {
      return request.pre.processed;
    }
  }
};

function processing(request) {
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
      poll.has_voted = voted;
      thread.poll = poll;
    }

    return {
      thread: thread,
      banned_from_board: bannedFromBoard,
      write_access: writeAccess,
      limit: opts.limit,
      page: opts.page,
      posts: common.cleanPosts(posts, userId, viewables, request, thread)
    };
  })
  // handle page or start out of range
  .then(function(ret) {
    var retVal = Boom.notFound();
    if (ret.posts.length > 0) { retVal = ret; }
    return retVal;
  })
  .error(request.errorMap.toHttpError);

  return promise;
}
