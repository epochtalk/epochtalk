var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

function create(mention) {
  var threadId = helper.deslugify(mention.threadId);
  var postId = helper.deslugify(mention.postId);
  var mentionerId = helper.deslugify(mention.mentionerId);
  var mentioneeId = helper.deslugify(mention.mentioneeId);

  // Only create mention if the mentionee has permission to see the board
  var q = `INSERT INTO mentions.mentions
    (thread_id, post_id, mentioner_id, mentionee_id, created_at)
    SELECT $1, $2, $3, $4, now()
    WHERE
    EXISTS (
      SELECT 1
      FROM boards b2
      WHERE b2.id = (SELECT board_id FROM threads WHERE id = $1)
      AND ( b2.viewable_by IS NULL OR b2.viewable_by >= (SELECT r.priority FROM roles_users ru, roles r WHERE ru.role_id = r.id AND ru.user_id = $4 ORDER BY r.priority limit 1) )
      AND ( SELECT EXISTS ( SELECT 1 FROM board_mapping WHERE board_id = (SELECT board_id FROM threads WHERE id = $1)))
    )
    RETURNING id`;
  return db.scalar(q, [threadId, postId, mentionerId, mentioneeId]);
}

function page(mentioneeId, opts) {
  mentioneeId = helper.deslugify(mentioneeId);
  var limit = opts.limit || 25;
  var page = opts.page || 1;
  var offset = (page * limit) - limit;
  var extended = opts.extended;
  var results = {
    page: page,
    limit: limit,
    prev: page > 1,
    extended: extended
  };
  limit = limit + 1;
  var extPostBody = extended ? 'p.content->>\'body\' as body,' : '';
  var extBoardName = extended ? 'b.name as board_name,' : '';
  var extBoardId = extended ? 'b.id as board_id,' : '';
  var extThreadId = extended ? 'p.thread_id,' : '';
  var q = `SELECT
      m.id,
      m.thread_id,
      (SELECT t.slug FROM threads t WHERE m.thread_id = t.id) as thread_slug,
      (SELECT p2.content ->> 'title' as title FROM posts p2 WHERE p2.thread_id = m.thread_id ORDER BY p2.created_at ASC LIMIT 1),
      m.post_id,
      p.position as post_start,
      ${extPostBody}
      ${extBoardName}
      ${extBoardId}
      ${extThreadId}
      (SELECT u.username from users u WHERE m.mentioner_id = u.id) as mentioner,
      (SELECT up.avatar from users.profiles up where up.user_id = m.mentioner_id) as mentioner_avatar,
      m.created_at,
      n.id as notification_id,
      n.viewed
    FROM mentions.mentions m,
    threads t,
    boards b,
    notifications n,
    posts p
    WHERE m.mentionee_id = $1
    AND (m.id = uuid(n.data->>\'mentionId\'))
    AND (p.id = m.post_id)
    AND (p.thread_id = t.id)
    AND (t.board_id = b.id)
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3`;
  return db.sqlQuery(q, [mentioneeId, limit, offset])
  .then(function(data) {
    results.next = data.length === limit;
    if (results.next) { data.pop(); }
    results.data = data;
    return results;
  })
  .then(helper.slugify);
}

function remove(mentionId, userId) {
  var q;
  var id;
  // If mentionId is specified delete specific mention
  if (mentionId) {
    id = helper.deslugify(mentionId);
    q = 'DELETE FROM mentions.mentions WHERE id = $1';
  }
  // If mentionId is not specified delete all mentions
  else {
    id = helper.deslugify(userId);
    q = 'DELETE FROM mentions.mentions WHERE mentionee_id = $1';
  }
  return db.sqlQuery(q, [id])
  .then(function() { return { deleted: true }; });
}

function getUserIgnored(userId, ignoredUserId) {
  userId = helper.deslugify(userId);
  ignoredUserId = helper.deslugify(ignoredUserId);
  var q = 'SELECT ignored_user_id FROM mentions.ignored WHERE user_id = $1 AND ignored_user_id = $2';
  return db.scalar(q, [userId, ignoredUserId])
  .then(function(ignoredUserId) {
    return { ignored: ignoredUserId ? true : false };
  });
}

function pageIgnoredUsers(userId, opts) {
  userId = helper.deslugify(userId);
  var limit = opts.limit || 25;
  var page = opts.page || 1;
  var offset = (page * limit) - limit;
  var results = {
    page: page,
    limit: limit,
    prev: page > 1
  };
  limit = limit + 1;
  var q = `SELECT u.username, u.id, up.avatar, True as ignored
    FROM mentions.ignored i
    JOIN users u ON (u.id = i.ignored_user_id)
    JOIN users.profiles up ON (up.user_id = i.ignored_user_id)
    WHERE i.user_id = $1 LIMIT $2 OFFSET $3`;
  return db.sqlQuery(q, [userId, limit, offset])
  .then(function(data) {
    results.next = data.length === limit;
    if (results.next) { data.pop(); }
    results.data = data;
    return results;
  })
  .then(helper.slugify);
}

function ignoreUser(userId, ignoredUserId) {
  userId = helper.deslugify(userId);
  ignoredUserId = helper.deslugify(ignoredUserId);
  var q = 'INSERT INTO mentions.ignored(user_id, ignored_user_id) VALUES($1, $2)';
  return db.sqlQuery(q, [userId, ignoredUserId])
  .then(function() {
    return { success: true };
  });
}

function unignoreUser(userId, ignoredUserId) {
  userId = helper.deslugify(userId);
  ignoredUserId = helper.deslugify(ignoredUserId);
  var q, params;
  if (ignoredUserId) { // Delete specific ignored user
    q = 'DELETE FROM mentions.ignored WHERE user_id = $1 AND ignored_user_id = $2';
    params = [userId, ignoredUserId];
  }
  else { // Delete all ignored users
    q = 'DELETE FROM mentions.ignored WHERE user_id = $1';
    params = [userId];
  }
  return db.sqlQuery(q, params)
  .then(function() {
    return { success: true };
  });
}

function fixTextSearchVector(post) {
  var q = `SELECT
    setweight(to_tsvector('simple', COALESCE($1,'')), 'A') ||
    setweight(to_tsvector('simple', COALESCE($2,'')), 'B')
    AS tsv`;
  return db.scalar(q, [ post.title, post.body_original ])
  .then(function(data) {
    q = 'UPDATE posts SET tsv = $1 WHERE id = $2 RETURNING id';
    return db.sqlQuery(q, [ data.tsv, helper.deslugify(post.id) ]);
  })
  .then(helper.slugify);
}

function enableMentionEmails(userId, enabled) {
  userId = helper.deslugify(userId);

  var q = `INSERT INTO users.preferences (user_id, email_mentions)
           VALUES ($1, $2)
           ON CONFLICT (user_id) DO UPDATE SET email_mentions = $2`;
  var params = [ userId, enabled ];
  return db.sqlQuery(q, params)
  .then(function() { return { enabled: enabled }; });
}

function getMentionEmailSettings(userId) {
  userId = helper.deslugify(userId);

  var q = 'SELECT email_mentions FROM users.preferences WHERE user_id = $1';
  var params = [ userId ];
  return db.scalar(q, params)
  .then(function(data) {
    if (data === null) { return { email_mentions: true }; }
    else { return data; }
  });
}

module.exports = {
  create: create,
  page: page,
  remove: remove,
  getUserIgnored: getUserIgnored,
  pageIgnoredUsers: pageIgnoredUsers,
  ignoreUser: ignoreUser,
  unignoreUser: unignoreUser,
  fixTextSearchVector: fixTextSearchVector,
  enableMentionEmails: enableMentionEmails,
  getMentionEmailSettings: getMentionEmailSettings
};
