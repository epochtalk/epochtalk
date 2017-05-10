require('dotenv').load({ silent: true });
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
var path = require('path');
var core = require('epochtalk-core-pg')({ conString: process.env.DATABASE_URL });
module.exports = {
  notifications: core.notifications,
  users: require(path.normalize(__dirname + '/../modules/ept-users')).db,
  categories: require(path.normalize(__dirname + '/../modules/ept-categories')).db,
  boards: require(path.normalize(__dirname + '/../modules/ept-boards')).db,
  threads: require(path.normalize(__dirname + '/../modules/ept-threads')).db,
  posts: require(path.normalize(__dirname + '/../modules/ept-posts')).db
};
