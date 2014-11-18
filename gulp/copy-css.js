var gulp = require('gulp');
var rename = require('gulp-rename');

gulp.task('copy-css', function(cb) {
  var data = false;
  var finished = 0;
  gulp.src('./node_modules/foundation/scss/foundation/components/*.scss')
    .pipe(gulp.dest('./app/scss/foundation/components'))
    .on('data', function() { data = true; })
    .on('end', function() {
      if (!data) {
        console.error('Foundation not found in node_modules');
        return console.error('Please make sure Foundation is installed through npm install');
      }
      else {
       data = false;
       if (++finished === 4) { cb(); }
      }
    });
  gulp.src('./node_modules/foundation/scss/*.scss')
    .pipe(gulp.dest('./app/scss'))
    .on('data', function() { data = true; })
    .on('end', function() {
      if (!data) {
        console.error('Foundation not found in node_modules');
        return console.error('Please make sure Foundation is installed through npm install');
      }
      else {
       data = false;
       if (++finished === 4) { cb(); }
      }
    });
  gulp.src('./node_modules/medium-editor/dist/css/medium-editor.css')
    .pipe(rename('medium-editor.scss'))
    .pipe(gulp.dest('./app/scss'))
    .on('data', function() { data = true; })
    .on('end', function() {
      if (!data) {
        console.error('medium-editor.css not found in node_modules');
        return console.error('Please make sure Medium-Editor is installed through npm install');
      }
      else {
       data = false;
       if (++finished === 4) { cb(); }
      }
    });
  gulp.src('./node_modules/medium-editor/dist/css/themes/default.css')
    .pipe(rename('default.scss'))
    .pipe(gulp.dest('./app/scss'))
    .on('data', function() { data = true; })
    .on('end', function() {
      if (!data) {
        console.error('default.css not found in node_modules');
        return console.error('Please make sure Medium-Editor is installed through npm install');
      }
      else {
       data = false;
       if (++finished === 4) { cb(); }
      }
    });
});