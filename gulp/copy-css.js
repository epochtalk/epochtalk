var gulp = require('gulp');
var rename = require('gulp-rename');
var async  = require('async');

gulp.task('copy-css', function(cb) {
  var data = false;
  async.parallel([function(asyncCb) {
    gulp.src('./node_modules/foundation/scss/foundation/components/*.scss')
      .pipe(gulp.dest('./app/scss/foundation/components'))
      .on('data', function() { data = true; })
      .on('end', function() {
        if (!data) {
          var error = new Error('Foundation sass components not found in node_modules\n' +
            'Please make sure Foundation is installed through npm install');
          asyncCb(error);
        }
        else {
          data = false;
          asyncCb();
        }
      });
  }, function(asyncCb) {
    gulp.src('./node_modules/foundation/scss/*.scss')
      .pipe(gulp.dest('./app/scss'))
      .on('data', function() { data = true; })
      .on('end', function() {
        if (!data) {
          var error = new Error('Foundation sass not found in node_modules\n' +
            'Please make sure Foundation is installed through npm install');
          asyncCb(error);
        }
        else {
          data = false;
          asyncCb();
        }
      });
  }, function(asyncCb) {
    gulp.src('./node_modules/medium-editor/dist/css/medium-editor.css')
      .pipe(rename('medium-editor.scss'))
      .pipe(gulp.dest('./app/scss'))
      .on('data', function() { data = true; })
      .on('end', function() {
        if (!data) {
          var error = new Error('medium-editor.css not found in node_modules\n' +
            'Please make sure Medium-Editor is installed through npm install');
          asyncCb(error);
        }
        else {
          data = false;
          asyncCb();
        }
      });
  }, function(asyncCb) {
    gulp.src('./node_modules/medium-editor/dist/css/themes/default.css')
      .pipe(rename('default.scss'))
      .pipe(gulp.dest('./app/scss'))
      .on('data', function() { data = true; })
      .on('end', function() {
        if (!data) {
          var error = new Error('default.css not found in node_modules\n' +
            'Please make sure Medium-Editor is installed through npm install');
          asyncCb(error);
        }
        else {
          data = false;
          asyncCb();
        }
      });
  }], function(err) {
    if (err) {
      cb();
      return console.error(err);
    }
    else { return cb(); }
  });
});