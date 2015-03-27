var path = require('path');
var config = require(path.normalize(__dirname + '/config'));
var core = require('epochtalk-core-pg');
module.exports = core(config.db);
