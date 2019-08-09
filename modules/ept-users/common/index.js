var common = {};
module.exports = common;

var cheerio = require('cheerio');

function clean(sanitizer, payload) {
  var keys = ['username', 'email', 'name', 'website', 'btc_address', 'gender', 'location', 'language', 'avatar', 'position'];
  keys.map(function(key) {
    if (payload[key]) { payload[key] = sanitizer.strip(payload[key]); }
  });

  var displayKeys = ['signature', 'raw_signature'];
  displayKeys.map(function(key) {
    if (payload[key]) { payload[key] = sanitizer.display(payload[key]); }
  });
  return payload;
}

function parse(parser, payload) {
  payload.signature = parser.parse(payload.raw_signature);
  return payload;
}

function imagesSignature(imageStore, payload) {
  // remove images in signature
  if (payload.signature) {
    var $ = cheerio.load(payload.signature);
    $('img').remove();
    payload.signature = $.html();
  }

  // clear the expiration on user's avatar
  if (payload.avatar) {
    imageStore.clearExpiration(payload.avatar);
  }
  return payload;
}

var formatUser = function(user) {
  Object.keys(user).forEach(function(key) {
    var value = user[key];
    if (!value) { delete user[key];}
  });
  if (user.fields) {
   Object.keys(user.fields).forEach(function(fieldKey) {
    var value = user.fields[fieldKey];
    if (value) { user[fieldKey] = value; }
   });
  }
  delete user.fields;
  return user;
};

var insertUserProfile = function(user, client) {
  var q = 'INSERT INTO users.profiles (user_id, avatar, position, signature, raw_signature, fields) VALUES ($1, $2, $3, $4, $5, $6)';
  var params = [user.id, user.avatar, user.position, user.signature, user.raw_signature, user.fields];
  return client.query(q, params);
};

var updateUserProfile = function(user, client) {
  var q = 'UPDATE users.profiles SET user_id = $1, avatar = $2, position = $3, signature = $4, raw_signature = $5, fields = $6 WHERE user_id = $1';
  var params = [user.id, user.avatar, user.position, user.signature, user.raw_signature, user.fields];
  return client.query(q, params);
};

var insertUserPreferences = function(user, client) {
  var q = 'INSERT INTO users.preferences (user_id, posts_per_page, threads_per_page, collapsed_categories) VALUES ($1, $2, $3, $4)';
  var params = [user.id, user.posts_per_page, user.threads_per_page, user.collapsed_categories];
  return client.query(q, params);
};

var updateUserPreferences = function(user, client) {
  var q = 'UPDATE users.preferences SET posts_per_page = $2, threads_per_page = $3, collapsed_categories = $4 WHERE user_id = $1';
  var params = [user.id, user.posts_per_page, user.threads_per_page, user.collapsed_categories];
  return client.query(q, params);
};

common.clean = clean;
common.parse = parse;
common.formatUser = formatUser;
common.insertUserProfile = insertUserProfile;
common.updateUserProfile = updateUserProfile;
common.insertUserPreferences = insertUserPreferences;
common.updateUserPreferences = updateUserPreferences;

common.export = () =>  {
  return [
    {
      name: 'common.users.clean',
      method: clean
    },
    {
      name: 'common.users.parse',
      method: parse
    },
    {
      name: 'common.images.signature',
      method: imagesSignature
    }
  ];
};
