require('dotenv').load();
var repl = require('repl');
var server = repl.start('ept> ');
var db = require(__dirname + '/../db');
var util = require('util');

server.context.db = db;

server.context.users = {
  byUsername: function(username) {
    db.users.userByUsername(username).then(function(user) {
      util.log(user);
    });;
  }
}

server.context.posts = {
  find: function(slug) {
    return db.posts.find(slug).tap(console.log);
  }
}
