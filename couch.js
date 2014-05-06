var config = require(__dirname + '/../config');
console.log('config');
console.log(config);

var nano = require('nano')(config.couchdb.url);
var dbName = config.couchdb.name;
var couch = nano.use(dbName);

module.exports = couch;
