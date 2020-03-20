var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

/* return all values */
module.exports = function(userId) {
  userId = helper.deslugify(userId);
  var q = `
    SELECT
      posts_per_page,
      threads_per_page,
      timezone_offset,
      patroller_view,
      collapsed_categories,
      ignored_boards,
      notify_replied_threads
    FROM users.preferences
    WHERE user_id = $1
  `;
  return db.sqlQuery(q, [userId])
  .then(function(rows) {
    if (rows.length > 0) { return rows[0]; }
    else {
      return {
        posts_per_page: 25,
        threads_per_page: 25,
        timezone_offset: '',
        patroller_view: false,
        collapsed_categories: { cats: [] },
        ignored_boards: { boards: [] },
        notify_replied_threads: true
      };
    }
  })
  .then(function(prefs) {
    if (prefs.collapsed_categories) {
      prefs.collapsed_categories = prefs.collapsed_categories.cats;
    }
    else { prefs.collapsed_categories = []; }
    if (prefs.ignored_boards) {
      prefs.ignored_boards = prefs.ignored_boards.boards;
    }
    else { prefs.ignored_boards = []; }
    return prefs;
  })
  .then(helper.slugify);
};
