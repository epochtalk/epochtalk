#!/usr/bin/env node
'use strict';
var yargs = require('yargs')
.usage('Epochtalk Database Tool');
var argv = yargs.argv;
var couchapp = require('couchapp');
var config = require(__dirname + '/server/config');
var nano = require('nano')(config.couchdb.url);
var dbName = config.couchdb.name;
var ddoc = require(__dirname + '/db/ddoc');

var setupDatabase = function(cb) {
  nano.db.create(dbName, function(err) {
    if (err) {
      console.log(err.reason);
    }
    else {
      var dbUrl = config.couchdb.url + '/' + dbName;
      console.log('Database created: ' + dbUrl);
      couchapp.createApp(ddoc, dbUrl, function(app) {
        app.push();
      });
    }
    return cb(err);
  });
};

var create = argv.create;
var recreate = argv.recreate;
if (recreate) {
  nano.db.destroy(dbName, function(err, body) {
    if (err) {
      console.log(err.reason);
    }
    else {
      console.log(body);
      setupDatabase(function(err) {
        if (!err) {
          console.log('Database is recreated.');
        }
      });
    }
  });
}
else if (create) {
  setupDatabase(function(err) {
    if (!err) {
      console.log('Database is now set up.');
    }
  });
}
else {
  console.log(yargs.help());
}

