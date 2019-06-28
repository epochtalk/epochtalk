var path = require('path');
var setup = require(path.join(__dirname, 'setup'));

function core(opts) {
  var core = {};

  setup(opts);

  core.helper = require(path.join(__dirname, 'helper'));
  core.errors = require(path.join(__dirname, 'errors'));

  var db = require(path.join(__dirname, 'db'));
  core.db = db;
  core.close = function() {
    console.log('Closing db connection pool');
    db.pool.end();
  };
  return core;
}

module.exports = core;
