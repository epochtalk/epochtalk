var config = require('./config');
var boards = require('./db/boards');
var topics = require('./db/topics');
var messages = require('./db/messages');

var db = {};
db.boards = boards;
db.topics = topics;
db.messages = messages;
module.exports = db;

