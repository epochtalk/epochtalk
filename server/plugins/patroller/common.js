var _ = require('lodash');

function format(post) {
  post.user = {
    id: post.user_id,
    name: post.name,
    username: post.username,
    priority: post.priority,
    deleted: post.user_deleted,
    signature: post.signature,
    highlight_color: post.highlight_color,
    role_name: post.role_name
  };
  delete post.user_id;
  delete post.username;
  delete post.priority;
  delete post.name;
  delete post.user_deleted;
  delete post.signature;
  delete post.highlight_color;
  delete post.role_name;
  return post;
}

/**
 *  ViewContext can be an array of boards or a boolean
 */
function clean(posts, currentUserId, viewContext) {
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

module.exports = {
  format: format,
  clean: clean
};
