var memStore = {};
module.exports = memStore;

var Promise = require('bluebird');
var levelUp = require('levelup');
var memdown = require('memdown');
var memDb = levelUp('', { db: memdown});

memDb.getAsync = function(key) {
  return new Promise(function(fulfill, reject) {
    memDb.get(key, function(err, value) {
      if (err) { reject(err); }
      else { fulfill(value); }
    });
  });
};

memDb.putAsync = function(key, value) {
  return new Promise(function(fulfill, reject) {
    memDb.put(key, value, function(err) {
      if (err) { reject(err); }
      else { fulfill(value); }
    });
  });
};

memDb.delAsync = function(key) {
  return new Promise(function(fulfill, reject) {
    memDb.del(key, function(err) {
      if (err) { reject(err); }
      else { fulfill(value); }
    });
  });
};

memStore.db = memDb;