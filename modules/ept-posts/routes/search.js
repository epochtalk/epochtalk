var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Posts
  * @api {GET} /search/posts Search Posts
  * @apiName PostsSearch
  * @apiPermission User
  * @apiDescription This allows users to search forum posts.
  *
  * @apiParam (Query) {number{1..n}} [page=1] The page of search results to retrieve
  * @apiParam (Query) {number{1..100}} [limit=25] The number of search results per page
  * @apiParam (Query) {boolean} [desc=false] Boolean indicating whether or not to sort the results in descending order
  * @apiParam (Query) {string} [search] The term to search posts for
  *
  * @apiSuccess {number} limit The number of results returned per page
  * @apiSuccess {string} page The current page of the results
  * @apiSuccess {number} desc The order the results are sorted in
  * @apiSuccess {string} search The search term used in query for posts
  * @apiSuccess {number} next The number of the next page of search results
  * @apiSuccess {number} prev The number of the previous page of search results
  * @apiSuccess {object[]} posts An array of post objects
  * @apiSuccess {string} posts.id The unique id of the post
  * @apiSuccess {string} posts.thread_title The title of the thread the post belongs to
  * @apiSuccess {string} posts.user_id The id of the author of the post
  * @apiSuccess {timestamp} posts.created_at Timestamp of when the post was created
  * @apiSuccess {string} posts.thread_id The id of the thread the post belongs to
  * @apiSuccess {number} posts.position The position of the post within the thread
  * @apiSuccess {string} posts.body The body of the post
  * @apiSuccess {string} posts.board_id The id of the board the post belongs to
  * @apiSuccess {string} posts.board_name The name of the board the post belongs to
  * @apiSuccess {string} posts.user User object containing info about user who made post
  * @apiSuccess {string} posts.user.username Username of the user who made the post
  *
  * @apiError (Error 500) InternalServerError There was an error retrieving the users
  */
module.exports = {
  method: 'GET',
  path: '/api/search/posts',
  config: {
    app: { hook: 'posts.search' },
    auth: { strategy: 'jwt' },
    validate: {
      query: {
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(25),
        desc: Joi.boolean().default(false),
        search: Joi.string()
      }
    },
    pre: [
      { method: 'auth.posts.search(server, auth)' },
      { method: 'hooks.preProcessing' },
      [
        { method: 'hooks.parallelProcessing', assign: 'parallelProcessed' },
        { method: processing, assign: 'processed' },
      ],
      { method: 'hooks.merge' },
      { method: 'hooks.postProcessing' }
    ]
  },
  handler: function(request, reply) {
    return reply(request.pre.processed);
  }
};

function insert(str, index, value) {
  return str.substr(0, index) + value + str.substr(index);
}

function processing(request, reply) {
  var opts = {
    limit: request.query.limit,
    page: request.query.page,
    desc: request.query.desc,
    search: request.query.search
  };
  var userPriority = request.server.plugins.acls.getUserPriority(request.auth);
  var promise = request.db.posts.search(opts, userPriority)
  .then(function(data) {
    // Loop through all posts
    data.posts.forEach(function(post) {
      // Wrap matched text in body with start and end tag
      var toMatch = post.body_match;

      var highlightedWords = toMatch
      .match(/<mark>(.*?)<\/mark>/g) || [];

      highlightedWords = highlightedWords.map(function(val){
        return val.replace(/<\/?mark>/g,'');
      });

      toMatch = toMatch.replace(/<mark>/g, '').replace(/<\/mark>/g, '');
      var matchStart = post.body.indexOf(toMatch);

      // Check that were not inside a bbcode tag when marking the start
      if (toMatch.indexOf(']') < toMatch.indexOf('[')) {
        matchStart = post.body.substr(0, matchStart).lastIndexOf('[');
      }

      var startMark = '{START-' + post.id + '}';
      post.body = insert(post.body, matchStart, startMark);

      var matchEnd = matchStart + startMark.length + toMatch.length + 1;

      // Check that were not inside a bbcode tag when marking the end
      if (toMatch.lastIndexOf(']') < toMatch.lastIndexOf('[')) {
        matchEnd = matchEnd + post.body.substr(matchEnd, post.body.length).indexOf(']') + 1;
      }

      var endMark = '{END-' + post.id + '}';
      post.body = insert(post.body, matchEnd, endMark);

      // Parse the post
      post.body_html = request.parser.parse(post.body);

      // extract matched text
      var start = post.body_html.indexOf(startMark) + startMark.length;
      var end = post.body_html.indexOf(endMark) - start;
      var matchedText = post.body_html.substr(start, end);


      // Grab and empty the tags before the match
      matchStart = post.body_html.indexOf(startMark);
      var beforeTags = post.body_html.substr(0, matchStart).replace(/>([^<]*)</g, '><');
      beforeTags = beforeTags.substr(0, beforeTags.lastIndexOf('>') + 1);
      beforeTags = beforeTags.substr(beforeTags.indexOf('<'), beforeTags.length);

      // Grab and empty the tags after the match
      matchEnd = post.body_html.indexOf(endMark) + endMark.length;
      var afterTags = post.body_html.substr(matchEnd, post.body_html.length).replace(/>([^<]*)</g, '><');
      afterTags = afterTags.substr(0, afterTags.lastIndexOf('>') + 1);
      afterTags = afterTags.substr(afterTags.indexOf('<'), afterTags.length);

      highlightedWords.forEach(function(word) {
        // mark highlighted words that arent between quotes
        matchedText = matchedText.replace(new RegExp('\\b' + word + '\\b(?!;|<|>|")', 'g'), '<mark>' + word + '</mark>');
      });

      // combine matched
      var emptyTags = /<[^\/>][^>]*><\/[^>]+>/g;
      post.body_html = beforeTags + matchedText + afterTags;
      post.body_html = post.body_html.replace(emptyTags, '');

      post.body = post.body.replace(startMark, '').replace(endMark, '');
      delete post.body_match;


    });
    return data;
  })
  .error(request.errorMap.toHttpError);

  return reply(promise);
}
