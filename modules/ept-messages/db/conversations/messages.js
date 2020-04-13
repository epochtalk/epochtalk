var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var helper = dbc.helper;
var db = dbc.db;
var Promise = require('bluebird');

module.exports = function(conversationId, viewerId, opts) {
  conversationId = helper.deslugify(conversationId);
  viewerId = helper.deslugify(viewerId);

  opts = opts || {};
  var limit = opts.limit || 15;
  var timestamp = opts.timestamp || new Date();
  var messageId = opts.messageId;
  if (messageId) { messageId = helper.deslugify(messageId); }
  var params = [conversationId, viewerId, timestamp, limit];

  var columns = 'mid.id, mid.conversation_id, mid.sender_id, mid.receiver_ids, mid.content, mid.created_at, mid.viewed, mid.read_by_user_ids, mid.reported, s.username as sender_username, s.deleted as sender_deleted, s.avatar as sender_avatar';
  var q = 'SELECT pm.conversation_id, pm.read_by_user_ids, pm.id, pm.sender_id, pm.receiver_ids, pm.content, pm.created_at, pm.viewed, CASE WHEN EXISTS (SELECT rm.id FROM administration.reports_messages rm WHERE rm.offender_message_id = pm.id AND rm.reporter_user_id = $2) THEN \'TRUE\'::boolean ELSE \'FALSE\'::boolean END AS reported FROM messages.private_messages pm WHERE $2 != ALL(deleted_by_user_ids) AND conversation_id = $1 AND (pm.sender_id = $2 OR $2 = ANY(pm.receiver_ids)) AND pm.created_at <= $3';
  var q2 = 'SELECT u.username, u.deleted, up.avatar FROM users u LEFT JOIN users.profiles up ON u.id = up.user_id WHERE u.id = mid.sender_id';

  if (messageId) {
    var withId = ' AND id != $4 ORDER BY created_at DESC LIMIT $5';
    q = q + withId;
    params = [conversationId, viewerId, timestamp, messageId, limit];
  }
  else { q = q + ' ORDER BY created_at DESC LIMIT $4'; }

  var query = 'SELECT ' + columns + ' FROM ( ' +
    q + ' ) mid LEFT JOIN LATERAL ( ' +
    q2 + ' ) s ON true ORDER BY mid.created_at DESC';

  // get all related posts
  return db.sqlQuery(query, params)
  .map(function(data) {
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
  .tap(function(data) {
    var readByUserIds;
    var q = 'SELECT read_by_user_ids FROM messages.private_conversations WHERE id = $1';
    return db.scalar(q, [conversationId])
    .then(function(dbData) {
      readByUserIds = dbData.read_by_user_ids || [];
      if (!readByUserIds.includes(viewerId)) { readByUserIds.push(viewerId); }
      q = 'UPDATE messages.private_conversations SET read_by_user_ids = $1 WHERE id = $2';
      return db.scalar(q, [readByUserIds, conversationId]);
    })
    .then(function() {
      q = 'UPDATE messages.private_messages SET read_by_user_ids = $1 WHERE conversation_id = $2';
      return db.scalar(q, [readByUserIds, conversationId])
    })
  })
  .then(helper.slugify);
};
