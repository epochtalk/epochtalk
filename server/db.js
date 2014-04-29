var boards = require('./db/boards');
var threads = require('./db/threads');
var posts = require('./db/posts');

var db = {};
db.boards = boards;
db.threads = threads;
db.posts = posts;
module.exports = db;
