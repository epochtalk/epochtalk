var config = require(__dirname + '/../config');
var boards = require(__dirname + '/boards');
var threads = require(__dirname + '/threads');
var posts = require(__dirname + '/posts');


var db = {};
db.boards = boards;
db.threads = threads;
db.posts = posts;
module.exports = db;
