var del = require('del');
var Promise = require('bluebird');

module.exports = function() {
  return new Promise(function(resolve, reject) {
    del(
      [
        'public/css/*.css',
        'app/scss/default.scss',
        'app/scss/medium-editor.scss',
        'app/scss/foundation/components',
        'app/scss/normalize.scss',
        'app/scss/foundation.scss',
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
