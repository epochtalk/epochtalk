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
      collapsed_categories,
      notify_created_threads,
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
        collapsed_categories: { cats: [] },
        notify_created_threads: true,
        notify_replied_threads: true
      };
    }
  })
  .then(function(prefs) {
    if (prefs.collapsed_categories) {
      prefs.collapsed_categories = prefs.collapsed_categories.cats;
    }
    else { prefs.collapsed_categories = []; }
    return prefs;
  })
  .then(helper.slugify);
};
