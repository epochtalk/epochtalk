var path = require('path');
var del = require('del');
var Promise = require('bluebird');
var fs = require('fs');
var previewVarsPath = path.normalize(__dirname + '/../../app/scss/ept/_preview-variables.scss');

module.exports = function() {
  return new Promise(function(resolve, reject) {
    del(
      [
        'public/css/*.css',
        'public/js/*.js'
      ],
      function(err) {
        if (err) { return reject(err); }
        return resolve();
      }
    );
  })
  .then(function() { // wipe preview vars file (handles case where server was killed while previewing)
    fs.truncateSync(previewVarsPath, 0);
    console.log('Cleaning Complete.');
    return;
  });
};
