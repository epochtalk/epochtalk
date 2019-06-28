var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

module.exports = function(config) {
  if (config.portal && config.portal.board_id) {
    config.portal.board_id = helper.deslugify(config.portal.board_id);
  }

  // Copy fields from config
  var storedConfig = (({
    gaKey,
    images,
    portal,
    emailer,
    website,
    postMaxLength,
    inviteOnly,
    logEnabled,
    rateLimiting,
    loginRequired,
    verifyRegistration
  }) => ({
    gaKey,
    images,
    portal,
    emailer,
    website,
    postMaxLength,
    inviteOnly,
    logEnabled,
    rateLimiting,
    loginRequired,
    verifyRegistration
  }))(config);

  // For now we are hardcoding 'default' as the main config
  // In the future we can support swappable configs
  var q = 'INSERT INTO configurations (name, config) VALUES (\'default\', $1)';
  return db.sqlQuery(q, [storedConfig]);
};
