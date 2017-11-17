var path = require('path');
var Promise = require('bluebird');
var config = require(path.normalize(__dirname + '/../config'));
var redis = Promise.promisifyAll(require('redis'));
var redisClient = redis.createClient(config.redis);

var dbPrefix = 'online-users';
var online = module.exports = {};

online.logOptions = function() {
  console.log('[WSS] Redis Configurations:\n', JSON.stringify(config.redis, null, 2));
};

online.quit = function() {
  return redisClient.quit();
};

online.clear = function() {
  return redisClient.flushdbAsync();
};

online.isOnline = function(user) {
  var key = dbPrefix + ':' + user.id;
  return redisClient.scardAsync(key)
  .then(function(listingCount) {
    if (listingCount) { return true; }
    else { return false; }
  });
};

online.add = function(user) {
  var key = dbPrefix + ':' + user.id;
  return redisClient.saddAsync(key, user.socketId);
};

online.remove = function(user) {
  var key = dbPrefix + ':' + user.id;
  return redisClient.sremAsync(key, user.socketId);
};
