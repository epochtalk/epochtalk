'use strict';
var config = require(__dirname + '/../config');
var nano = require('nano')(config.couchdb.url);
var dbName = config.couchdb.name;
var couch = nano.use(dbName);

module.exports = couch;

