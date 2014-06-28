var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var config = require(__dirname + '/config');

var users = {};
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
  // --- pass through to API
  return done(null, user.email);
});

passport.deserializeUser(function(email, done) {
  return done(null, {
    username: 'ed',
    email: email,
    _id: 311
  });
});

module.exports = passport;

