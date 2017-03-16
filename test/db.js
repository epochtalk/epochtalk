require('dotenv').load();
var path = require('path');
module.exports = {
  categories: require(path.normalize(__dirname + '/../modules/ept-categories')).db,
  boards: require(path.normalize(__dirname + '/../modules/ept-boards')).db
};
