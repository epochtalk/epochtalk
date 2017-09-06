var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var helper = dbc.helper;
var db = dbc.db;

module.exports = function(userId, opts) {
  userId = helper.deslugify(userId);
  opts = opts || {};

  var columns = 'mid.id, mid.conversation_id, mid.sender_id, mid.receiver_id, mid.body, mid.subject, mid.created_at, mid.updated_at, mid.viewed, s.username as sender_username, s.deleted as sender_deleted, s.avatar as sender_avatar, r.username as receiver_username, r.deleted as receiver_deleted, r.avatar as receiver_avatar';
  var q = ` SELECT * FROM
    ( SELECT
      DISTINCT ON (conversation_id) conversation_id, id, sender_id,
      receiver_id, body, subject, created_at, viewed, (SELECT max(p.created_at) FROM private_messages p WHERE p.conversation_id = conversation_id) as updated_at
      FROM private_messages
      WHERE (SELECT $1 = ANY(pc.deleted_by_user_ids) as deleted
      FROM private_conversations pc WHERE pc.id = conversation_id) IS FALSE AND $1 != ALL(deleted_by_user_ids)
      AND (sender_id = $1 OR receiver_id = $1)
      ORDER BY conversation_id, created_at DESC )
      AS m ORDER BY m.created_at DESC LIMIT $2 OFFSET $3`;
  var q2 = 'SELECT u.username, u.deleted, up.avatar FROM users u LEFT JOIN users.profiles up ON u.id = up.user_id WHERE u.id = mid.sender_id';
  var q3 = 'SELECT u.username, u.deleted, up.avatar FROM users u LEFT JOIN users.profiles up ON u.id = up.user_id WHERE u.id = mid.receiver_id';
  var query = 'SELECT ' + columns + ' FROM ( ' +
    q + ' ) mid LEFT JOIN LATERAL ( ' +
    q2 + ' ) s ON true LEFT JOIN LATERAL ( ' +
    q3 + ' ) r ON true ORDER BY mid.created_at DESC';

  var limit = 15;
  var page = 1;
  if (opts.limit) { limit = opts.limit; }
  if (opts.page) { page = opts.page; }
  var offset = (page * limit) - limit;

  // get all related posts
  var params = [userId, limit, offset];
  return db.sqlQuery(query, params)
  .then(helper.slugify);
};

