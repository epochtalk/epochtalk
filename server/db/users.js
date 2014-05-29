'use strict';
var _ = require('lodash');
var config = require(__dirname + '/../config');
var couch = require(__dirname + '/couch');
var dbName = config.couchdb.name;
var recordType = 'users';
var bcrypt = require('bcrypt');
var users = {};

// validation for reg
var validate = function(user) {
  var valid = false;
  valid = user.password === user.confirm_password;
  valid = valid && user.email.length > 5;
  // prepare for storage or match
  user.type = 'user';
  user.passhash = bcrypt.hashSync(user.password, 12);
  user.timestamps = { created: new Date().getTime() };
  delete user.password;
  delete user.confirm_password;
  return valid;
};

users.register = function(user, cb) {
  if (validate(user)) {
    couch.insert(user, cb);
  }
  else {
    console.log('validation failed on user: ');
    console.log(user);
    err = new Error('Validation failed on user: ' + user.email);
    cb(err, null);
  }
};

users.login = function(user, cb) {
  console.log('login...');
  var filter = {};
  filter.key = user.email;
  filter.include_docs = true;
  filter.limit = 1;

  couch.view(dbName, recordType + 'ByEmail', filter, function(err, res) {
    var storedUser;
    if (res && res.rows && res.rows.length > 0) {
      storedUser = res.rows[0].doc;
      var matchHash = bcrypt.compareSync(user.password, storedUser.passhash);
      if (!matchHash) {
        err = new Error('Login failed: Bad password.');
      }
      else {
        // remove passhash before sending back to client
        delete storedUser.passhash;
      }
    }
    else {
      err = new Error('Login failed: No such user.');
    }
    cb(err, storedUser);
  });
  // get user from couch, match hash

}

module.exports = users;
