var config = require(__dirname + '/../config');
var db = {};
db.boards = require(__dirname + '/boards');
db.threads = require(__dirname + '/threads');
db.posts = require(__dirname + '/posts');
db.users = require(__dirname + '/users');
db.profiles = require(__dirname + '/profiles');

module.exports = db;
