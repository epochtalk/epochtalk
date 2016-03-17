var path = require('path');
var del = require('del');
var fs = require('fs');
var Promise = require('bluebird');
var previewVarsPath = path.normalize(__dirname + '/../../app/scss/ept/variables/_preview-variables.scss');

module.exports = function() {
  return del(['public/css/*.css', 'public/js/*.js'])
  .then(function() { // wipe preview vars file (handles case where server was killed while previewing)
    return new Promise(function(resolve, reject) {
      if (fs.existsSync(previewVarsPath)) {
        fs.truncate(previewVarsPath, 0, function(err) {
         if (err) { return reject(err); }
         return resolve();
        });
      }
      else { return resolve(); }
   });
  })
  .then(function() {
    console.log('Cleaning Complete.');
    return;
  })
  .catch(console.log);
};
