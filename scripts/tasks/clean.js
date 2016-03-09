var path = require('path');
var del = require('del');
var Promise = require('bluebird');
var fs = require('fs');
var previewVarsPath = path.normalize(__dirname + '/../../app/scss/ept/variables/_preview-variables.scss');

module.exports = function() {
  return del(['public/css/*.css', 'public/js/*.js'])
  .then(function() { return fs.truncateSync(previewVarsPath, 0); })
  .then(function() { // wipe preview vars file (handles case where server was killed while previewing)
    console.log('Cleaning Complete.');
    return;
  })
  .catch(console.log);
};
