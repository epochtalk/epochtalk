var livereload = require('livereload');

module.exports = function() {
  livereload = require('livereload');
  server = livereload.createServer();
  server.watch('./public/');
};
