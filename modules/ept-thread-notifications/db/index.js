var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

function getSubscriberEmailData(threadId, userId) {
  threadId = helper.deslugify(threadId);
  userId = helper.deslugify(userId);

  var q = `SELECT email, username, (SELECT content ->> 'title' as title from posts WHERE thread_id = $1 ORDER BY created_at LIMIT 1) as title FROM users WHERE id = ANY(SELECT user_id FROM users.thread_subscriptions WHERE thread_id = $1 AND user_id != $2)`;
  var params = [threadId, userId];

  return db.sqlQuery(q, params);
}

function subscribe(userId, threadId) {
  userId = helper.deslugify(userId);
  threadId = helper.deslugify(threadId);
  var q = 'SELECT notify_replied_threads FROM users.preferences WHERE user_id = $1';
  var params = [ userId ];
  return db.scalar(q, params)
  .then(function(prefs) {
    var subscribe = true;
    if (prefs) { subscribe = prefs.notify_replied_threads; }
    if (subscribe) {
      q = 'INSERT INTO users.thread_subscriptions (user_id, thread_id) VALUES ($1, $2) ON CONFLICT DO NOTHING';
      params = [ userId, threadId ];
      return db.sqlQuery(q, params);
    }
    else { return; }
  });
}

function removeSubscriptions(userId) {
  userId = helper.deslugify(userId);

  var q = 'DELETE FROM users.thread_subscriptions WHERE user_id = $1';
  var params = [ userId ];
  return db.sqlQuery(q, params);
}

module.exports = {
  subscribe: subscribe,
  removeSubscriptions: removeSubscriptions,
  getSubscriberEmailData: getSubscriberEmailData
};
