'use strict';
var _ = require('lodash');
var config = require(__dirname + '/../config');
var couch = require(__dirname + '/couch');
var dbName = config.couchdb.name;
var recordType = 'users';
var bcrypt = require('bcrypt');
var users = {};
var speakeasy = require('speakeasy');

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
    var key = speakeasy.generate_key({length : 20, google_auth_qr: true});
    // qrcode.generate('otpauth://totp/foo?secret=' + key.base32, function(qrCode) {
    //   console.log(qrCode);
    // });
    user.totp_key = key;
    couch.insert(user, cb);
  }
  else {
    console.log('validation failed on user: ');
    console.log(user);
    var err = new Error('Validation failed on user: ' + user.email);
    cb(err, null);
  }
};

users.login = function(user, cb) {
  var filter = {};
  filter.key = user.email;
  filter.include_docs = true;
  filter.limit = 1;
  var authedUser;
  couch.view(dbName, recordType + 'ByEmail', filter, function(err, res) {
    var storedUser;
    if (res && res.rows && res.rows.length > 0) {
      storedUser = res.rows[0].doc;
      var otp = speakeasy.totp({key: storedUser.totp_key.ascii});
      var matchOTP = (otp === user.otp);
      var matchHash = bcrypt.compareSync(user.password, storedUser.passhash);
      if (matchHash && matchOTP) {
        authedUser = storedUser;
        // remove before sending back to client
        delete authedUser.totp_key;
        delete authedUser.passhash;
      }
      else {
        err = new Error('Login failed: Bad password.');
      }
    }
    else {
      err = new Error('Login failed: No such user.');
    }
    cb(err, authedUser);
  });
};

module.exports = users;
