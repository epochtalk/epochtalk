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
  var extPostBody = extended ? 'p.body,' : '';
  var extBoardName = extended ? 'b.name as board_name,' : '';
  var extBoardId = extended ? 'b.id as board_id,' : '';
  var extThreadId = extended ? 'p.thread_id,' : '';
  var q = `SELECT
      m.id,
      m.thread_id,
      (SELECT p2.title FROM posts p2 WHERE p2.thread_id = m.thread_id ORDER BY p2.created_at ASC LIMIT 1),
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

function remove(mentionId) {
  mentionId = helper.deslugify(mentionId);
  var q = 'DELETE FROM mentions.mentions WHERE id = $1';
  return db.sqlQuery(q, [mentionId])
  .then(function() { return { id: helper.slugify(mentionId) }; });
}

module.exports = {
  create: create,
  page: page,
  remove: remove
};
