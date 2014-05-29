var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var config = require(__dirname + '/config');
var db = require(__dirname + '/db');
var couch = require(__dirname + '/db/couch');
var dbName = config.couchdb.name;

var users = {};
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  db.users.login(user, function(err, user) {
    if (err) {
      return done(new Error('Unable to login.'));
    }
    else {
      return done(null, user.email);
    }
  });
});

passport.deserializeUser(function(email, done) {
  var filter = {};
  filter.key = email;
  filter.include_docs = true;
  filter.limit = 1;
  couch.view(dbName, 'usersByEmail', filter, function(err, res) {
    var storedUser = res.rows[0].doc;
    return done(err, storedUser);
  });
});

module.exports = passport;

