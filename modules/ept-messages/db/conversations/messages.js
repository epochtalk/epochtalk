var path = require('path');
var dbc = require(path.normalize(__dirname + '/../db'));
var helper = dbc.helper;
var db = dbc.db;

module.exports = function(conversationId, viewerId, opts) {
  conversationId = helper.deslugify(conversationId);
  viewerId = helper.deslugify(viewerId);

  opts = opts || {};
  var limit = opts.limit || 15;
  var timestamp = opts.timestamp || new Date();
  var messageId = opts.messageId;
  if (messageId) { messageId = helper.deslugify(messageId); }
  var params = [conversationId, viewerId, timestamp, limit];

  var columns = 'mid.id, mid.conversation_id, mid.sender_id, mid.receiver_id, mid.body, mid.created_at, mid.viewed, mid.reported, s.username as sender_username, s.deleted as sender_deleted, s.avatar as sender_avatar, r.username as receiver_username, r.deleted as receiver_deleted, r.avatar as receiver_avatar';
  var q = 'SELECT pm.conversation_id, pm.id, pm.sender_id, pm.receiver_id, pm.body, pm.created_at, pm.viewed, CASE WHEN EXISTS (SELECT rm.id FROM administration.reports_messages rm WHERE rm.offender_message_id = pm.id AND rm.reporter_user_id = $2) THEN \'TRUE\'::boolean ELSE \'FALSE\'::boolean END AS reported FROM private_messages pm WHERE $2 != ALL(deleted_by_user_ids) AND conversation_id = $1 AND (pm.sender_id = $2 OR pm.receiver_id = $2) AND pm.created_at <= $3';
  var q2 = 'SELECT u.username, u.deleted, up.avatar FROM users u LEFT JOIN users.profiles up ON u.id = up.user_id WHERE u.id = mid.sender_id';
  var q3 = 'SELECT u.username, u.deleted, up.avatar FROM users u LEFT JOIN users.profiles up ON u.id = up.user_id WHERE u.id = mid.receiver_id';

  if (messageId) {
    var withId = ' AND id != $4 ORDER BY created_at DESC LIMIT $5';
    q = q + withId;
    params = [conversationId, viewerId, timestamp, messageId, limit];
  }
  else { q = q + ' ORDER BY created_at DESC LIMIT $4'; }

  var query = 'SELECT ' + columns + ' FROM ( ' +
    q + ' ) mid LEFT JOIN LATERAL ( ' +
    q2 + ' ) s ON true LEFT JOIN LATERAL ( ' +
    q3 + ' ) r ON true';

  // get all related posts
  return db.sqlQuery(query, params)
  .then(helper.slugify);
};
