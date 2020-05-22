var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var helper = dbc.helper;
var db = dbc.db;
var Promise = require('bluebird');

module.exports = function(userId, opts) {
  userId = helper.deslugify(userId);
  opts = opts || {};

  var columns = 'mid.id, mid.conversation_id, mid.sender_id, mid.receiver_ids, mid.content, mid.created_at, mid.read_by_user_ids, s.username as sender_username, s.deleted as sender_deleted, s.avatar as sender_avatar, s.newbie_alert as sender_newbie_alert';
  var q = ` SELECT * FROM
    ( SELECT
      DISTINCT ON (conversation_id) conversation_id, id, sender_id,
      receiver_ids, content, created_at, (SELECT read_by_user_ids FROM messages.private_conversations WHERE id = conversation_id)
      FROM messages.private_messages
      WHERE (SELECT $1 = ANY(pc.deleted_by_user_ids) as deleted
      FROM messages.private_conversations pc WHERE pc.id = conversation_id) IS FALSE AND $1 != ALL(deleted_by_user_ids)
      AND (sender_id = $1 OR $1 = ANY(receiver_ids))
      ORDER BY conversation_id, created_at DESC )
      AS m ORDER BY m.created_at DESC LIMIT $2 OFFSET $3`;
  var q2 = 'SELECT CASE WHEN EXISTS (SELECT ru.user_id FROM roles_users ru WHERE ru.user_id = mid.sender_id AND ru.role_id = \'08dd21e5-9781-4c6a-8c6f-3c1574c59a85\') THEN \'TRUE\'::boolean ELSE \'FALSE\'::boolean END AS newbie_alert, u.username, u.deleted, up.avatar FROM users u LEFT JOIN users.profiles up ON u.id = up.user_id WHERE u.id = mid.sender_id';
  var query = 'SELECT ' + columns + ' FROM ( ' +
    q + ' ) mid LEFT JOIN LATERAL ( ' +
    q2 + ' ) s ON true ORDER BY mid.created_at DESC';

  var limit = 15;
  var page = 1;
  if (opts.limit) { limit = opts.limit; }
  if (opts.page) { page = opts.page; }
  var offset = (page * limit) - limit;

  // get all related posts
  var params = [userId, limit, offset];
  return db.sqlQuery(query, params)
  .map(function(data) {
    if (data && data.read_by_user_ids) {
      data.viewed = data.read_by_user_ids.includes(userId);
      delete data.read_by_user_ids;
    }
    else { data.viewed = false; }
    if (data && data.receiver_ids.length) {
      return Promise.map(data.receiver_ids, function(receiverId) {
        var userQuery = 'SELECT u.username, u.deleted, up.avatar FROM users u LEFT JOIN users.profiles up ON u.id = up.user_id WHERE u.id = $1';
        return db.scalar(userQuery, [receiverId]);
      })
      .then(function(receiverData) {
        data.receivers = receiverData;
        if (data.content && !data.content.body_html) { data.content.body_html = data.content.body; }
        return data;
      });
    }
    else { return data; }
  })
  .map(function(data) {
    if (data) {
      var subjectQuery = 'SELECT content->>\'subject\' as subject FROM messages.private_messages WHERE conversation_id = $1 AND content->>\'subject\' IS NOT NULL';
      return db.scalar(subjectQuery, [data.conversation_id])
      .then(function(dbData) {
        data.content.subject = dbData.subject;
        return data;
      });
    }
  })
  .then(helper.slugify);
};
