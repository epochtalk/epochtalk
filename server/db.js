var boards = require('./db/boards');
var threads = require('./db/threads');
var messages = require('./db/messages');

var db = {};
db.boards = boards;
db.threads = threads;
db.messages = messages;
module.exports = db;
