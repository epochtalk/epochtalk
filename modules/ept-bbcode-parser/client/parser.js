var bbcodeCompiler = require('./bbcode');
var parser = require('./parseFactory')(bbcodeCompiler);
module.exports = parser;
