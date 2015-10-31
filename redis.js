var path = require('path');
var config = require(path.normalize(__dirname + '/config'));
var Promise = require('bluebird');
var redis = Promise.promisifyAll(require('redis'));
var redisClient;
if (config.redis.url) {
  redisClient = redis.createClient(config.redis.url, config.redis.options);
}
else {
  redisClient = redis.createClient(config.redis.port, config.redis.host, config.redis.options);
}
module.exports = redisClient;
