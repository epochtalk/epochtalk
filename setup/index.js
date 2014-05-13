'use strict';
var fs = require('fs');
var usage = fs.readFileSync(__dirname + '/usage', 'utf-8');
var yargs = require('yargs')
  .options('i', {alias : 'import'})
  .usage(usage);
var argv = yargs.argv;
var couchapp = require('couchapp');
var config = require(__dirname + '/../server/config');
var nano = require('nano')(config.couchdb.url);
var dbName = config.couchdb.name;
var ddoc = require(__dirname + '/../couch/ddoc');
var dbUrl = config.couchdb.url + '/' + dbName;

var setupDatabase = function(cb) {
  nano.db.create(dbName, function(err) {
    if (err) {
      console.log(err.reason);
    }
    else {
      console.log('Database created: ' + dbUrl);
      couchapp.createApp(ddoc, dbUrl, function(app) {
        app.push();
      });
    }
    return cb(err);
  });
};

if (argv.recreate) {
  nano.db.destroy(dbName, function(err, body) {
    if (err) {
      console.log(err.reason);
    }
    else {
      setupDatabase(function(err) {
        if (!err) {
          console.log('Database is recreated.');
        }
      });
    }
  });
}
else if (argv.create) {
  setupDatabase(function(err) {
    if (!err) {
      console.log('Database is now set up.');
    }
  });
}
else if (argv.update) {
  couchapp.createApp(ddoc, dbUrl, function(app) {
    app.push();
  });
}
else if (argv.i) {
  try {
    var importerPath = __dirname + '/../importers/' + argv.i;
    var importer = require(importerPath);
    console.log('Starting import via: ' + importerPath);
    importer.start(dbName, function(err, body) {
      console.log(body);
    });
  }
  catch(err) {
    console.log(err);
  }
}
else {
  console.log(yargs.help());
}
