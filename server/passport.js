var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var db = require(__dirname + '/db');

var users = {};
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(id, done) {
  var user = users[id];
  if (user) done(null, user);
  else done(null, false);
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    done(null, {user: 'foo'});
  }
));

module.exports = passport;

