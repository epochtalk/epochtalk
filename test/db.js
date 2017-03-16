require('dotenv').load();
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
var path = require('path');
module.exports = {
  categories: require(path.normalize(__dirname + '/../modules/ept-categories')).db,
  boards: require(path.normalize(__dirname + '/../modules/ept-boards')).db
};
