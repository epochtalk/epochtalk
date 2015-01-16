var path = require('path');
var config = require(path.join(__dirname, 'config'));
module.exports = require('epochtalk-core-pg')(config);
