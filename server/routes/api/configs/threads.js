var path = require('path');
var uuid = require('node-uuid');
var Promise = require('bluebird');
var core = require('epochcore')();
var threadSchema = require('../schema/threads');
var memDb = require(path.join('..', '..', '..', 'memStore')).db;

exports.create = {
  handler: function(request, reply) {
    // build the thread post object from payload and params
    var newThread = {
      title: request.payload.title,
      body: request.payload.body,
      board_id: request.payload.board_id
    };

    // create the thread in core
    core.threads.create(newThread)
    .then(function(thread) {
      reply(thread);
    })
    .catch(function(err) {
      reply(err.message);
    });
  },
  validate: {
    payload: threadSchema.validate
  }
};

exports.byBoard = {
  handler: function(request, reply) {
    var boardId = request.query.board_id || request.params.board_id;
    var opts = {
      limit: request.query.limit || request.params.limit,
      page: request.query.page || request.params.page
    };
    core.threads.byBoard(boardId, opts)
    .then(function(threads) {
      reply(threads);
    })
    .catch(function(err) {
      reply(err.message);
    });
  },
  validate: {
    params: threadSchema.validateByBoard,
    query: threadSchema.validateByBoard
  }
};

exports.find = {
  handler: function(request, reply) {
    var viewerId = request.headers['epoch-viewer'];
    var viewerAddress = request.info.remoteAddress;
    var threadId = request.params.id || request.query.id;
    var newViewerId;

    console.log(viewerId);

    var findThread = core.threads.find(threadId);
    var testViewKeys = function(id, address) {
      if (id) { // viewerId was sent back so try that
        var idKey = id + threadId;
        return checkViewKey(idKey) // returns if inc is valid
        .catch(function(err) { // viewId didn't exist so try address
          putAsync(idKey, Date.now()); // save to memdb
          var addressKey = address + threadId;
          return checkViewKey(addressKey) // returns if inc is valid
          // address doesn't exists so inc is valid
          .catch(function() {
            putAsync(addressKey, Date.now());
            return true;
          });
        });
      } // no viewerId, check IP 
      else {
        newViewerId = uuid.v4(); // generate new viewerId
        putAsync(newViewerId + threadId, Date.now()); // save to mem db
        var addressKey = address + threadId;
        return checkViewKey(addressKey) // returns if inc is valid
        // address doesn't exists so inc is valid
        .catch(function(err) {
          putAsync(addressKey, Date.now());
          return true;
        });
      }
    };
    var testKeys = testViewKeys(viewerId, viewerAddress);

    return Promise.join(testKeys, findThread,
      function (viewValid, thread) {
        // increment view count if necessary
        if (viewValid) { core.threads.incViewCount(threadId); }

        // add new viewerId to header if necessary
        if (newViewerId) {
          console.log(newViewerId);
          return reply(thread).header('Epoch-Viewer', newViewerId);
        }
        else { return reply(thread); }
      }
    ).catch(function(err) { reply(err.message);});
  }
};

// helper methods

var getAsync = function(key) {
  return new Promise(function(fulfill, reject) {
    memDb.get(key, function(err, value) {
      if (err) { reject(err); }
      else { fulfill(value); }
    });
  });
};

var putAsync = function(key, value) {
  return new Promise(function(fulfill, reject) {
    memDb.put(key, value, function(err) {
      if (err) { reject(err); }
      else { fulfill(value); }
    });
  });
};

var checkViewKey = function(key) {
  return getAsync(key)
  .then(function(storedTime) {
    var timeElapsed = Date.now() - storedTime;
    // key exists and is past the cooling period
    // update key with new value and return true
    if (timeElapsed > 1000 * 60) {
      return putAsync(key, Date.now())
      .then(function() { return true; });
    }
    // key exists but before cooling period
    // do nothing and return false
    else { return false; }
  });
};
