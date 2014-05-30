'use strict';
var config = require(__dirname + '/../config');
var couch = require(__dirname + '/couch');
var dbName = config.couchdb.name;
var recordType = 'users';

var profiles = {};
module.exports = profiles;

profiles.find = function(userId, cb) {
  couch.view(dbName, recordType, { key: userId }, function(err, body) {
    var profile;
    if (!err && body.rows && body.rows.length > 0) {
      profile = body.rows[0].value;
      delete profile.type;
      delete profile.passhash;
      delete profile.timestamps;
      delete profile._rev;
      delete profile._id;
    }
    return cb(err, profile);
  });
};