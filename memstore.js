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
      else { fulfill(); }
    });
  });
};

memDb.imageQuery = function() {
  return new Promise(function(fulfill, reject) {
    var entries = [];
    var sorter = function(entry) { entries.push(entry); };
    var handler = function() { return fulfill(entries); };

    // query key
    var startKey = 'image' + 0;
    var endKey = 'image' + Date.now();
    var queryOptions = {
      gte: startKey,
      lte: endKey
    };

    memDb.createReadStream(queryOptions)
    .on('data', sorter)
    .on('error', reject)
    .on('close', handler)
    .on('end', handler);
  });
};

memStore.db = memDb;
