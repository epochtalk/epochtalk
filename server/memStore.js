var memStore = {};
module.exports = memStore;

var levelUp = require('levelup');
var memdown = require('memdown');
var memDb = levelUp('', { db: memdown});

memStore.db = memDb;