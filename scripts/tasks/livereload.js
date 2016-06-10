var livereload = require('livereload');

module.exports = function() {
  if (process.env.NODE_ENV !== 'production') {
    livereload = require('livereload');
    var server = livereload.createServer();
    server.watch('./public/');
  }
};
