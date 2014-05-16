var config = require(__dirname + '/../server/config');
var nano = require('nano')(config.couchdb.url);
var dbName = config.couchdb.name;
var ddoc = require(__dirname + '/../couch/ddoc');
var dbUrl = config.couchdb.url + '/' + dbName;

var seed = {};
module.exports = seed;

seed.seed = function() {
  console.log(dbUrl);
};
