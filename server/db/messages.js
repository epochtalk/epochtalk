'use strict';
var config = require(__dirname + '/../config');
var _ = require('underscore');
var nano = require('nano')(config.couchdb.url);
var messages = {};
var dbName = config.couchdb.dbName;
var recordType = 'message';
var couch = nano.use(config.couchdb.dbName);

module.exports = messages;

