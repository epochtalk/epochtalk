'use strict';
var mysql = require('mysql');
var nano = require('nano')('http://localhost:5984');
var CLEAN = true;
var connection = mysql.createConnection({
  host: 'localhost',
  database: 'smf',
  user: 'root',
  password: ''
});
var db;
// type refers to type when in couchdb
var importTable = function(table, type) {
  console.log('Importing ' + table + ' with type: ' + type);
  connection.query('select * from ' + table, function(err, rows) {
    if (err) throw err;
    rows.forEach(function(row) {
      row.type = type;
      db.insert(row, function(err) {
        if (!err) {
          console.log(err);
        }
      });
    });
  });
};

var importStart = function() {
  db = nano.use('tng');
  connection.connect();
  importTable('smf_boards', 'board');
  importTable('smf_topics', 'topic');
  importTable('smf_messages', 'message');
  connection.end();
};
if (CLEAN) {
  nano.db.destroy('tng');
  nano.db.create('tng', function(err) {
    if (err) throw err;
    console.log('Database created.');
    importStart();
  });
}
else {
  importStart();
}


