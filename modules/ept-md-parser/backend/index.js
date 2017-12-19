var path = require('path');
var mdParser = require('marked');
var renderer = new mdParser.Renderer();
renderer.link = function(href) { return href; };
renderer.paragraph = function(text) { return text; };
module.exports = require(path.normalize(__dirname + '/../client/parseFactory'))(mdParser, renderer);
