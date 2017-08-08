var path = require('path');
var dbc = require(path.normalize(__dirname + '/db'));
var db = dbc.db;
var helper = dbc.helper;

function save(data) {
  var q = `
    UPDATE configurations SET config = config ||
    '{"motd": { "message": "` + data.motd + `", "mainViewOnly": ` + data.main_view_only + ` } }'
  `;

  return db.sqlQuery(q);
}


function get() {
  var q = 'SELECT config->\'motd\'->\'message\' as motd, config->\'motd\'->\'mainViewOnly\' as mainViewOnly FROM configurations';
  return db.scalar(q)
  .then(function(data) {
    console.log(data);
    return {
      motd: data.motd,
      main_view_only: data.mainViewOnly
    }
  });
}


module.exports = {
  save: save,
  get: get
};
