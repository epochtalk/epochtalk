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
  console.log(dbUrl);

  var users = [];

  for (var i = 0; i < 10; i++) {
    var name = Charlatan.Name.name();
    var email = Charlatan.Internet.email();
    var company = Charlatan.Company.name();
    var user = {
      name: name,
      email: email,
      company: company,
      type: 'user'
    };
    db.insert(user, function(err, body) {
      console.log(body);
    });
  }

};
