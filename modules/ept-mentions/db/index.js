var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

function create(mention) {
  var threadId = helper.deslugify(mention.threadId);
  var postId = helper.deslugify(mention.postId);
  var mentionerId = helper.deslugify(mention.mentionerId);
  var mentioneeId = helper.deslugify(mention.mentioneeId);

  var q = 'INSERT INTO mentions.mentions (thread_id, post_id, mentioner_id, mentionee_id, created_at) VALUES ($1, $2, $3, $4, now()) RETURNING id';
  return db.scalar(q, [threadId, postId, mentionerId, mentioneeId]);
}

function page(mentioneeId, opts) {
  mentioneeId = helper.deslugify(mentioneeId);
  var limit = opts.limit || 25;
  var page = opts.page || 1;
  var offset = (page * limit) - limit;
  var results = {
    page: page,
    limit: limit,
    prev: page > 1
  };
  limit = limit + 1;
  var q = 'SELECT m.thread_id, (SELECT p.title FROM posts p WHERE p.thread_id = m.thread_id ORDER BY p.created_at ASC LIMIT 1), m.post_id, (SELECT p.position FROM posts p WHERE p.id = m.post_id) as post_start, (SELECT u.username from users u WHERE m.mentioner_id = u.id) as mentioner, (SELECT up.avatar from users.profiles up where up.user_id = m.mentioner_id) as mentioner_avatar, m.created_at, n.id as notification_id, n.viewed FROM mentions.mentions m JOIN notifications n ON (m.id = uuid(n.data->>\'mentionId\')) WHERE m.mentionee_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3';
  return db.sqlQuery(q, [mentioneeId, limit, offset])
  .then(function(data) {
    results.next = data.length === limit;
    results.data = data;
    results.data.pop();
    return results;
  })
  .then(helper.slugify);
}

function remove(mentionId) {
  mentionId = helper.deslugify(mentionId);
  var q = 'DELETE FROM mentions.mentions WHERE id = $1';
  return db.sqlQuery(q, [mentionId]);
}

module.exports = {
  create: create,
  page: page,
  delete: remove
};
