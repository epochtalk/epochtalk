var bunyan = require('bunyan');
var log = bunyan.createLogger({name: "ept", level: 20});

module.exports = log;
