var path = require('path');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');
var dbc = require(path.normalize(__dirname + '/db'));
var common = require(path.normalize(__dirname + '/../common'));
var db = dbc.db;
var helper = dbc.helper;
var using = Promise.using;
var CreationError = Promise.OperationalError;

/* returns values including email, confirm and reset tokens */
module.exports = function(user) {
  user = helper.deslugify(user);
  var q, params, oldUser;

  return using(db.createTransaction(), function(client) {
    // query original user row
    q = 'SELECT u.id, u.username, u.email, u.passhash, u.confirmation_token, u.reset_token, u.reset_expiration, u.created_at, u.updated_at, u.imported_at, p.avatar, p.position, p.signature, p.raw_signature, p.fields FROM users u LEFT JOIN users.profiles p ON u.id = p.user_id WHERE u.id = $1';
    params = [user.id];
    return client.queryAsync(q, params)
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
      return client.queryAsync(q, params);
    })
    // query for user profile row
    .then(function() {
      q = 'SELECT * FROM users.profiles WHERE user_id = $1 FOR UPDATE';
      return client.queryAsync(q, [user.id])
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
      helper.updateAssign(user.fields, oldFields, user, 'btcAddress');
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
      return client.queryAsync(q, [user.id])
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
        threads_per_page: user.threads_per_page || 25
      };
      if (user.collapsed_categories) {
        prefs.collapsed_categories = { cats: user.collapsed_categories };
      }
      else { prefs.collapsed_categories = { cats: [] }; }

      if (exists) { return updateUserPreferences(prefs, client); }
      else { return insertUserPreferences(prefs, client); }
    })
    .then(function() { return common.formatUser(user); });
  })
  .then(helper.slugify);
};

function insertUserPreferences(user, client) {
  var q = 'INSERT INTO users.preferences (user_id, posts_per_page, threads_per_page, collapsed_categories) VALUES ($1, $2, $3, $4)';
  var params = [user.id, user.posts_per_page, user.threads_per_page, user.collapsed_categories];
  return client.queryAsync(q, params);
}

function updateUserPreferences(user, client) {
  var q = 'UPDATE users.preferences SET posts_per_page = $2, threads_per_page = $3, collapsed_categories = $4 WHERE user_id = $1';
  var params = [user.id, user.posts_per_page, user.threads_per_page, user.collapsed_categories];
  return client.queryAsync(q, params);
}
