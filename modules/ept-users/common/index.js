var common = {};
module.exports = common;

var cheerio = require('cheerio');

function clean(sanitizer, payload) {
  var keys = ['username', 'email', 'name', 'website', 'btcAddress', 'gender', 'location', 'language', 'avatar', 'position'];
  keys.map(function(key) {
    if (payload[key]) { payload[key] = sanitizer.strip(payload[key]); }
  });

  var displayKeys = ['signature', 'raw_signature'];
  displayKeys.map(function(key) {
    if (payload[key]) { payload[key] = sanitizer.display(payload[key]); }
  });
}

function parse(parser, payload) {
  payload.signature = parser.parse(payload.raw_signature);
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
  if (!user.avatar) {
    q = 'INSERT INTO users.profiles (user_id, position, signature, raw_signature, fields) VALUES ($1, $2, $3, $4, $5)';
    params = [user.id, user.position, user.signature, user.raw_signature, user.fields];
  }
  return client.queryAsync(q, params);
};

var updateUserProfile = function(user, client) {
  var q = 'UPDATE users.profiles SET user_id = $1, avatar = $2, position = $3, signature = $4, raw_signature = $5, fields = $6 WHERE user_id = $1';
  var params = [user.id, user.avatar, user.position, user.signature, user.raw_signature, user.fields];
  if (!user.avatar) {
    q = 'UPDATE users.profiles SET user_id = $1, position = $2, signature = $3, raw_signature = $4, fields = $5 WHERE user_id = $1';
    params = [user.id, user.position, user.signature, user.raw_signature, user.fields];
  }
  return client.queryAsync(q, params);
};

common.clean = clean;
common.parse = parse;
common.formatUser = formatUser;
common.insertUserProfile = insertUserProfile;
common.updateUserProfile = updateUserProfile;

common.export = () =>  {
  return [
    {
      name: 'common.users.clean',
      method: clean,
      options: { callback: false }
    },
    {
      name: 'common.users.parse',
      method: parse,
      options: { callback: false }
    },
    {
      name: 'common.images.signature',
      method: imagesSignature,
      options: { callback: false }
    }
  ];
};
