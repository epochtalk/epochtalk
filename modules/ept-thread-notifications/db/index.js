var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

function getSubscriberEmailData(threadId, userId) {
  threadId = helper.deslugify(threadId);
  userId = helper.deslugify(userId);

  var q = `SELECT u.email, u.username, u.id as user_id, (SELECT id from posts WHERE thread_id = $1 ORDER BY created_at DESC LIMIT 1) as last_post_id, (SELECT position from posts WHERE thread_id = $1 ORDER BY created_at DESC LIMIT 1) as last_post_position, (SELECT (user_id = u.id) as thread_author from posts WHERE thread_id = $1 ORDER BY created_at LIMIT 1), (SELECT content ->> 'title' as title from posts WHERE thread_id = $1 ORDER BY created_at LIMIT 1) as title FROM users u WHERE u.id = ANY(SELECT user_id FROM users.thread_subscriptions WHERE thread_id = $1 AND user_id != $2)`;
  var params = [threadId, userId];

  return db.sqlQuery(q, params)
  .then(helper.slugify);
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

function removeSubscription(userId, threadId) {
  userId = helper.deslugify(userId);
  threadId = helper.deslugify(threadId);
  var q = 'DELETE FROM users.thread_subscriptions WHERE user_id = $1 AND thread_id = $2 RETURNING user_id';
  var params = [ userId, threadId ];
  return db.scalar(q, params)
  .then(function() { return { deleted: true }; });
}

function removeSubscriptions(userId) {
  userId = helper.deslugify(userId);

  var q = 'DELETE FROM users.thread_subscriptions WHERE user_id = $1 RETURNING user_id';
  var params = [ userId ];
  return db.scalar(q, params)
  .then(function() { return { deleted: true }; });
}

function enableNotifications(userId, enabled) {
  userId = helper.deslugify(userId);

  var q = `INSERT INTO users.preferences (user_id, notify_replied_threads)
           VALUES ($1, $2)
           ON CONFLICT (user_id) DO UPDATE SET notify_replied_threads = $2`;
  var params = [ userId, enabled ];
  return db.sqlQuery(q, params)
  .then(function() { return { enabled: enabled }; });
}

function getNotificationSettings(userId) {
  userId = helper.deslugify(userId);

  var q = 'SELECT notify_replied_threads FROM users.preferences WHERE user_id = $1';
  var params = [ userId ];
  return db.scalar(q, params)
  .then(function(data) {
    if (data === null) { return { notify_replied_threads: true }; }
    else { return data; }
  });
}

module.exports = {
  subscribe: subscribe,
  getSubscriberEmailData: getSubscriberEmailData,
  removeSubscription: removeSubscription,
  removeSubscriptions: removeSubscriptions,
  enableNotifications: enableNotifications,
  getNotificationSettings: getNotificationSettings
};
