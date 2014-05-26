'use strict';
var config = require(__dirname + '/../config');
var nano = require('nano')({
  url: config.couchdb.url,
  log: function(id, args) {
    // console.log(id, args);
     console.log(decodeURI(args[0].headers.uri));
  }
});
var dbName = config.couchdb.name;
var couch = nano.use(dbName);

module.exports = couch;

