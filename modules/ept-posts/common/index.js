var _ = require('lodash');
var Boom = require('boom');
var cheerio = require('cheerio');
var Promise = require('bluebird');

var common = {};
module.exports = common;

common.checkPostLength = checkPostLength;
common.clean = clean;
common.parse = parse;
common.parseOut = parseOut;
common.cleanPosts = cleanPosts;
common.hasPriority = hasPriority;
common.formatPost = formatPost;

common.export = () =>  {
  return [
    {
      name: 'common.posts.checkPostLength',
      method: checkPostLength
    },
    {
      name: 'common.posts.clean',
      method: clean
    },
    {
      name: 'common.posts.parse',
      method: parse
    },
    {
      name: 'common.posts.parseOut',
      method: parseOut
    },
    {
      name: 'common.posts.newbieImages',
      method: newbieImages
    }
  ];
};

common.apiExport = () => {
  return { format: cleanPosts  };
};

function formatPost(post) {
  post.user = {
    id: post.user_id,
    name: post.name,
    username: post.username,
    priority: post.priority === null ? post.default_priority : post.priority,
    deleted: post.user_deleted,
    signature: post.signature,
    post_count: post.post_count,
    highlight_color: post.highlight_color,
    role_name: post.role_name
  };
  delete post.user_id;
  delete post.username;
  delete post.priority;
  delete post.default_priority;
  delete post.name;
  delete post.user_deleted;
  delete post.post_count;
  delete post.signature;
  delete post.highlight_color;
  delete post.role_name;
  return post;
}

function checkPostLength(server, postBody) {
  if (postBody && postBody.length > server.app.config.postMaxLength) {
    var msg = 'Error: body too long, max length is ' + server.app.config.postMaxLength;
    return Promise.reject(Boom.badRequest(msg));
  }
  else {
    return 200;
  }
}

function clean(sanitizer, payload) {
  payload = payload.body ? payload : payload.content;
  var hadLength = payload.body.length > 0;
  if (payload.title) {
    payload.title = sanitizer.strip(payload.title);
  }
  else if (payload.subject) {
    payload.subject = sanitizer.strip(payload.subject);
  }
  if (hadLength && !payload.body.length) {
    var msg = 'Error: body contained no data after sanitizing html tags.';
    return Promise.reject(Boom.badRequest(msg));
  }
  return 200;
}

function parse(parser, payload) {
  payload = payload.body ? payload : payload.content;
  var hadLength = payload.body.length > 0;
  payload.body_html = parser.parse(payload.body);
  if (hadLength && !payload.body_html.length) {
    var msg = 'Error: body contained no data after parsing';
    return Promise.reject(Boom.badRequest(msg));
  }
  // check if parsing was needed
  if (payload.body_html === payload.body) { payload.body_html = ''; }
  return 200;
}

function parseOut(parser, posts) {
  if (!posts) { return; }
  posts = posts.length ? posts : [ posts ];
  return Promise.each(posts, function(post) {
    post.body_html = parser.parse(post.body);
  });
}


function newbieImages(auth, payload) {
  // check if user is a newbie
  var isNewbie = false;
  auth.credentials.roles.map(function(role) {
    if (role === 'newbie') { isNewbie = true; }
  });
  if (!isNewbie) { return 200; }

  // load html in payload.body_html into cheerio
  var html = payload.body_html;
  var $ = cheerio.load(html);

  // collect all the images in the body
  $('img').each((index, element) => {
    var src = $(element).attr('src');
    var canonical = $(element).attr('data-canonical-src');
    var replacement = `<a href="${src}" target="_blank" data-canonical-src="${canonical}">${src}</a>`;
    $(element).replaceWith(replacement);
  });

  payload.body_html = $.html();
  return 200;
}

function hasPriority(server, auth, permission, postId, selfMod) {
  var hasPermission = server.plugins.acls.getACLValue(auth, permission);

  return server.db.posts.find(postId)
  .then(function(post) {
    // Allow users to perform actions on their own posts
    if (post.user.id == auth.credentials.id) { return Promise.resolve(true); }

    // get referenced user's priority
    var postUserPriority = server.db.users.find(post.user.id)
    .then(function(paramUser) { return _.min(_.map(paramUser.roles, 'priority')); })
    .error(() => { return Promise.reject(Boom.badRequest()); });

    // special check for patroller/newbie
    var hasPatrollerRole = false;
    auth.credentials.roles.map(function(role) {
      if (role === 'patroller') { hasPatrollerRole = true; }
    });

    var postOwnerIsUser = server.db.roles.posterHasRole(postId, 'user')
    .error(() => { return Promise.reject(Boom.badRequest()); });

    // get authed user's priority
    var authedUserPriority = server.db.users.find(auth.credentials.id)
    .then(function(authUser) { return _.min(_.map(authUser.roles, 'priority')); })
    .error(() => { return Promise.reject(Boom.badRequest()); });

    return Promise.join(postUserPriority, authedUserPriority, postOwnerIsUser, function(pid, aid, isUser) {
      // Authed user has higher or same priority than post's user
      if (hasPermission === true && aid <= pid) { return Promise.resolve(true); }
      // Allow patrollers to have priority over users in self moderated threads
      else if (selfMod === true && isUser === true && hasPatrollerRole === true) { return Promise.resolve(true); }
      else { return Promise.reject(Boom.forbidden());}
    });
  });
}

/**
 *  ViewContext can be an array of boards or a boolean
 */
function cleanPosts(posts, currentUserId, viewContext, request, thread, allowView) {
  var authedUserPriority = request.server.plugins.acls.getUserPriority(request.auth);
  var hasPriority = request.server.plugins.acls.getACLValue(request.auth, 'posts.byThread.bypass.viewDeletedPosts.priority');
  var hasSelfMod = request.server.plugins.acls.getACLValue(request.auth, 'posts.byThread.bypass.viewDeletedPosts.selfMod');
  var authedId = request.auth.credentials ? request.auth.credentials.id : null;
  var isModerator = thread ? (thread.user.id === authedId && thread.moderated) : false;

  posts = [].concat(posts);
  var viewables = viewContext;
  var viewablesType = 'boolean';
  var boards = [];
  if (_.isArray(viewContext)) {
    boards = viewContext.map(function(vd) { return vd.board_id; });
    viewablesType = 'array';
  }
  return posts.map(function(post) {
    var postHiddenByPriority = post.metadata ? post.metadata.hidden_by_priority : post.user.priority;
    var postHiddenById = post.metadata ? post.metadata.hidden_by_id : post.user.id;
    var authedUserHasPriority = authedUserPriority <= postHiddenByPriority;
    var authedUserHidePost = postHiddenById === authedId;

    // if currentUser owns post, show everything
    var viewable = false;
    if (currentUserId === post.user.id) { viewable = true; }
    // if viewables is an array, check if user is moderating this post
    else if (viewablesType === 'array' && _.includes(boards, post.board_id)) { viewable = true; }
    // if viewables is a true, view all posts
    else if (viewables) { viewable = true; }

    // Allow self mods to view posts hidden by users of the same or lesser role
    // post is hidden, only show users posts hidden by users of the same or greater priority
    if (((isModerator === true && hasSelfMod) || hasPriority) && post.deleted && authedId && authedUserPriority !== null) {
      viewable = (authedUserHasPriority || authedUserHidePost);
    }


    // remove deleted users or post information
    var deleted = false;
    if (post.deleted || post.user.deleted || post.board_visible === false) {
      deleted = true;
    }

    // format post
    if ((viewable || allowView) && deleted) { post.hidden = true; }
    else if (deleted) {
      post = {
        id: post.id,
        hidden: true,
        _deleted: true,
        position: post.position,
        thread_title: 'deleted',
        user: {}
      };
    }

    if (!post.deleted) { delete post.deleted; }
    delete post.board_visible;
    delete post.user.deleted;
    return post;
  });
}
