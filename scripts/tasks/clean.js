var del = require('del');
var Promise = require('bluebird');

module.exports = function() {
  return new Promise(function(resolve, reject) {
    del(
      [
        'public/css/*.css',
        'public/js/*.js'
      ],
      function(err) {
        if (err) { return reject(err); }
        console.log('Cleaning Complete.');
        return resolve();
      }
    );
  });
};
