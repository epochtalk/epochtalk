var formatPost = function(post) {
  post.user = {
    id: post.user_id,
    name: post.name,
    username: post.username,
    priority: post.priority || post.default_priority,
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
};

module.exports = {
  formatPost: formatPost,
};
