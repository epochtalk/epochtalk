var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

function save(data) {
  // cannot update jsonb using standard node-pg syntax
  var q = `
    UPDATE configurations SET config = config ||
    '{"motd": { "message": "` + data.motd + `", "mainViewOnly": ` + data.main_view_only + ` } }'
  `;
  return db.sqlQuery(q);
}


function get() {
  var q = 'SELECT config->\'motd\'->\'message\' as motd, config->\'motd\'->\'mainViewOnly\' as main FROM configurations';
  return db.scalar(q)
  .then(function(data) {
    return {
      motd: data.motd,
      main_view_only: data.main
    }
  });
}


module.exports = {
  save: save,
  get: get
};
