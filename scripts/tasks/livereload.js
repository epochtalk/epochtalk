var livereload = require('livereload');

module.exports = function() {
  if (process.env.NODE_ENV !== 'production') {
    livereload = require('livereload');
    server = livereload.createServer();
    server.watch('./public/');
  }
};
