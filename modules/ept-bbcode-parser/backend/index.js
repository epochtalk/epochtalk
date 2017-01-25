var path = require('path');
var bbcodeCompiler = require(path.normalize(__dirname + '/../client/bbcode'));
var parseFunction = require(path.normalize(__dirname + '/../client/parseFactory'));
var parser = parseFunction(bbcodeCompiler);
module.exports = parser;
