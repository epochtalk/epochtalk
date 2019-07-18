var path = require('path');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var common = require(path.normalize(__dirname + '/../common'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;
var errors = dbc.errors;
var CreationError = errors.CreationError;

/* returns values including email, confirm and reset tokens */
module.exports = function(user) {
  user = helper.deslugify(user);
  var q, params, oldUser;

  return using(db.createTransaction(), function(client) {
    // query original user row
    q = 'SELECT u.id, u.username, u.email, u.passhash, u.confirmation_token, u.reset_token, u.reset_expiration, u.created_at, u.updated_at, u.imported_at, p.avatar, p.position, p.signature, p.raw_signature, p.fields FROM users u LEFT JOIN users.profiles p ON u.id = p.user_id WHERE u.id = $1';
    params = [user.id];
    return client.query(q, params)
    .then(function(results) {
      if (results.rows.length > 0) { oldUser = results.rows[0]; }
      else { throw new CreationError('User Not Found'); }
    })
    // update user information, and update user row
    .then(function() {
      user.username = user.username || oldUser.username;
      user.email = user.email || oldUser.email;
      helper.updateAssign(user, oldUser, user, 'reset_expiration');
      helper.updateAssign(user, oldUser, user, 'reset_token');
      helper.updateAssign(user, oldUser, user, 'confimation_token');

      var passhash = null;
      if (user.password) { passhash = bcrypt.hashSync(user.password, 12); }
      else { passhash = oldUser.passhash; }
      delete user.password;

      q = 'UPDATE users SET username = $1, email = $2, passhash = $3, reset_token = $4, reset_expiration = $5, confirmation_token = $6, updated_at = now() WHERE id = $7';
      params = [user.username, user.email, passhash, user.reset_token, new Date(user.reset_expiration), user.confirmation_token, user.id];
      return client.query(q, params);
    })
    // query for user profile row
    .then(function() {
      q = 'SELECT * FROM users.profiles WHERE user_id = $1 FOR UPDATE';
      return client.query(q, [user.id])
      .then(function(results) {
        var exists = false;
        if (results.rows.length > 0) { exists = true; }
        return exists;
      });
    })
    // update or insert user profile row
    .then(function(exists) {
      var oldFields = oldUser.fields || {};

      // Special Profile Fields
      helper.updateAssign(user, oldUser, user, 'avatar');
      helper.updateAssign(user, oldUser, user, 'position');
      helper.updateAssign(user, oldUser, user, 'signature');
      helper.updateAssign(user, oldUser, user, 'raw_signature');

      // Generic Profile Fields
      user.fields = {};
      helper.updateAssign(user.fields, oldFields, user, 'name');
      helper.updateAssign(user.fields, oldFields, user, 'website');
      helper.updateAssign(user.fields, oldFields, user, 'btc_address');
      helper.updateAssign(user.fields, oldFields, user, 'gender');
      helper.updateAssign(user.fields, oldFields, user, 'dob');
      helper.updateAssign(user.fields, oldFields, user, 'location');
      helper.updateAssign(user.fields, oldFields, user, 'language');

      if (exists) { return common.updateUserProfile(user, client); }
      else { return common.insertUserProfile(user, client); }
    })
    // query for users.preferences row
    .then(function() {
      q = 'SELECT * FROM users.preferences WHERE user_id = $1 FOR UPDATE';
      return client.query(q, [user.id])
      .then(function(results) {
        var exists = false;
        if (results.rows.length) { exists = true; }
        return exists;
      });
    })
    // update or insert users.preferences row
    .then(function(exists) {
      var prefs = {
        id: user.id,
        posts_per_page: user.posts_per_page || 25,
        threads_per_page: user.threads_per_page || 25,
        notify_replied_threads: user.notify_replied_threads || true
      };
      if (user.collapsed_categories) {
        prefs.collapsed_categories = { cats: user.collapsed_categories };
      }
      else { prefs.collapsed_categories = { cats: [] }; }

      if (exists) { return common.updateUserPreferences(prefs, client); }
      else { return common.insertUserPreferences(prefs, client); }
    })
    .then(function() { return common.formatUser(user); });
  })
  .then(helper.slugify);
};
