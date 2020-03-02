var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(request) {
  // method type enum
  var findType = {
    board: request.db.boards.breadcrumb,
    category: request.db.categories.find,
    thread: request.db.threads.breadcrumb,
    post: request.db.posts.find
  };

  // Type enum
  var type = {
    board: 'board',
    category: 'category',
    thread: 'thread',
  };

  // Recursively Build breadcrumbs
  var buildCrumbs = function(id, curType, crumbs) {
    if (!id) { return crumbs; }
    return findType[curType](id)
    .then(function(obj) {
      console.log('\n\n', obj);
      var nextType, nextId;
      if (curType === type.category) { // Category
        var catName = obj.name;
        var anchor = (obj.name + '-' + obj.view_order).replace(/\s+/g, '-').toLowerCase();
        crumbs.push({ label: catName, state: '^.boards', opts: { '#': anchor }});
      }
      else if (curType === type.board) { // Board
        if (!obj.parent_id && obj.category_id) { // Has no Parent
          nextType = type.category;
          nextId = obj.category_id;
        }
        else { // Has Parent
          nextType = type.board;
          nextId = obj.parent_id;
        }
        crumbs.push({ label: obj.name, state: 'threads.data', opts: { boardId: id } });
        console.log('board', nextType, nextId);
      }
      else if (curType === type.thread) { // Thread
        crumbs.push({ label: obj.title, state: 'posts.data', opts: { threadId: id } });
        nextType = type.board;
        nextId = obj.board_id;
        console.log('here', nextType, nextId);
      }
      return buildCrumbs(nextId, nextType, crumbs);
    });
  };

  var q = 'SELECT p.*, t.*, u.username FROM posts p LEFT JOIN threads t ON p.thread_id = t.id LEFT JOIN users u ON p.user_id = u.id WHERE p.user_id IN (SELECT user_id FROM roles_users WHERE role_id = (SELECT id FROM roles WHERE lookup = \'newbie\')) ORDER BY p.created_at LIMIT 300;';
  return db.sqlQuery(q)
  .map(function(post) {
    // Build the breadcrumbs and reply
    return buildCrumbs(helper.slugify(post.thread_id), type.thread, [])
    .then(function(breadcrumbs) {
      console.log(breadcrumbs);
      post.breadcrumbs = breadcrumbs.reverse();
      return post;
    });
  })
  .then(helper.slugify);
};
