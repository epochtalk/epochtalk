var config = require(__dirname + '/../server/config');
var nano = require('nano')(config.couchdb.url);
var dbName = config.couchdb.name;
var ddoc = require(__dirname + '/../couch/ddoc');
var dbUrl = config.couchdb.url + '/' + dbName;

var Charlatan = require('charlatan');
var seed = {};
module.exports = seed;

seed.seed = function() {
  var db = nano.use(dbName);
  var users = [];
  for (var i = 0; i < 10; i++) {
    var user = generateUser();
    db.insert(user, function(err, body) {
      console.log(body);
    });
  }
  for (var i = 0; i < 10; i++) {
    var board = generateBoard();
    db.insert(board, function(err, body) {
      console.log(body);
    });
  }
  for (var i = 0; i < 100; i++) {
    var post = generatePost();
    db.insert(post, function(err, body) {
      console.log(body);
    });
  }
};

var generateUser = function() {
  var name = Charlatan.Name.name();
  var email = Charlatan.Internet.email();
  var company = Charlatan.Company.name();
  var user = {
    name: name,
    email: email,
    company: company,
    type: 'user'
  };
  return user;
};

var generateBoard = function() {
  var name = Charlatan.Lorem.words();
  var description = Charlatan.Lorem.paragraph();
  var board = {
    name: name,
    description: description,
    type: 'board'
  }
}

var generatePost = function() {
  var subject = Charlatan.Lorem.words();
  var body = Charlatan.Lorem.paragraph();
  var post = {
    subject: subject,
    body: body,
    type: 'post'
  };
  return post;
};

