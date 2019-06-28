var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(modLog) {
  modLog = helper.deslugify(modLog);
  var q = 'INSERT INTO moderation_log (mod_username, mod_id, mod_ip, action_api_url, action_api_method, action_obj, action_taken_at, action_type, action_display_text, action_display_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)';
  var params = [
    modLog.moderator.username,
    modLog.moderator.id,
    modLog.moderator.ip,
    modLog.action.api_url,
    modLog.action.api_method,
    modLog.action.obj,
    modLog.action.taken_at,
    modLog.action.type,
    modLog.action.display_text,
    modLog.action.display_url
  ];
  return db.sqlQuery(q, params);
};
