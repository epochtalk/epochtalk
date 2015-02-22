var path = require('path');
var config = require(path.join(__dirname, 'config'));
var core = require('epochtalk-core-pg');
module.exports = core(config.db);
