var _ = require('lodash');
var Boom = require('boom');
var cheerio = require('cheerio');
var Promise = require('bluebird');

var common = {};
module.exports = common;

common.clean = clean;
common.parse = parse;
common.parseOut = parseOut;
common.cleanPosts = cleanPosts;

common.export = () =>  {
  return [
    {
      name: 'common.posts.clean',
      method: clean,
      options: { callback: false }
    },
    {
      name: 'common.posts.parse',
      method: parse,
      options: { callback: false }
    },
    {
      name: 'common.posts.parseOut',
      method: parseOut,
      options: { callback: false }
    },
    {
      name: 'common.posts.newbieImages',
      method: newbieImages,
      options: { callback: false }
    },
    {
      name: 'common.posts.checkLockedQuery',
      method: checkLockedQuery,
      options: { callback: false }
    }
  ];
};

common.apiExport = () => {
  return { format: cleanPosts  };
};

function clean(sanitizer, payload) {
  payload.title = sanitizer.strip(payload.title);
  payload.body = sanitizer.bbcode(payload.body);
}

function parse(parser, payload) {
  payload.body_html = parser.parse(payload.body);

  // check if parsing was needed
  if (payload.body_html === payload.body) { payload.body_html = ''; }
}

function parseOut(parser, posts) {
  if (!posts) { return; }
  posts = posts.length ? posts : [ posts ];
  Promise.each(posts, function(post) {
    post.body_html = parser.parse(post.body);
  });
}


function newbieImages(auth, payload) {
  // check if user is a newbie
  var isNewbie = false;
  auth.credentials.roles.map(function(role) {
    if (role === 'newbie') { isNewbie = true; }
  });
  if (!isNewbie) { return; }

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
}

function checkLockedQuery(server, auth, postId, query) {
  // has lock query
  if (!query.locked) { return; }

  // has lock permissions
  var hasLocked = server.plugins.acls.getACLValue(auth, 'posts.lock.allow');

  // apply lock permission
  var cond = [
    {
      // permission based override
      type: 'hasPermission',
      server: server,
      auth: auth,
      permission: 'posts.lock.bypass.lock.admin'
    },
    {
      // is board moderator
      type: 'isMod',
      method: server.db.moderators.isModeratorWithPostId,
      args: [auth.credentials.id, postId],
      permission: server.plugins.acls.getACLValue(auth, 'posts.lock.bypass.lock.mod')
    },
    hasPriority(server, auth, 'posts.lock.bypass.lock.priority', postId)
  ];

  return server.authorization.stitch(Boom.forbidden(), cond, 'any')
  .then(function() {
    if (hasLocked) { return; }
    else { query.locked = ''; }
  })
  .catch(function() { query.locked = ''; });
}

function hasPriority(server, auth, permission, postId) {
  var actorPermission = server.plugins.acls.getACLValue(auth, permission);
  if (!actorPermission) { return Promise.reject(Boom.forbidden()); }

  var hasPatrollerRole = false;
  auth.credentials.roles.map(function(role) {
    if (role === 'patroller') { hasPatrollerRole = true; }
  });

  return server.db.roles.posterHasRole(postId, 'newbie')
  .then(function(posterIsNewbie) {
    if (hasPatrollerRole && posterIsNewbie) { return true; }
    else { return Promise.reject(Boom.forbidden()); }
  });
}

/**
 *  ViewContext can be an array of boards or a boolean
 */
function cleanPosts(posts, currentUserId, viewContext) {
  posts = [].concat(posts);
  var viewables = viewContext;
  var viewablesType = 'boolean';
  var boards = [];
  if (_.isArray(viewContext)) {
    boards = viewContext.map(function(vd) { return vd.board_id; });
    viewablesType = 'array';
  }

  return posts.map(function(post) {

    // if currentUser owns post, show everything
    var viewable = false;
    if (currentUserId === post.user.id) { viewable = true; }
    // if viewables is an array, check if user is moderating this post
    else if (viewablesType === 'array' && _.includes(boards, post.board_id)) { viewable = true; }
    // if viewables is a true, view all posts
    else if (viewables) { viewable = true; }

    // remove deleted users or post information
    var deleted = false;
    if (post.deleted || post.user.deleted || post.board_visible === false) { deleted = true; }

    // format post
    if (viewable && deleted) { post.hidden = true; }
    else if (deleted) {
      post = {
        id: post.id,
        hidden: true,
        _deleted: true,
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
