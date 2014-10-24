var path = require('path');
require(path.join(__dirname, 'gulp', 'sass'));
require(path.join(__dirname, 'gulp', 'browserify'));
var gulp = require('gulp');
var del = require('del');
var livereload = require('gulp-livereload');

gulp.task('build', ['copy-css', 'sass', 'browserify']);
gulp.task('default', ['build']);

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('app/**/*.{js,html,scss}', ['build']).on('change', livereload.changed);
  gulp.watch('public/**/*').on('change', livereload.changed);
  gulp.watch('server/**/*.js');
});

gulp.task('clean', function() {
  del([
    'app/css/*.css',
    'public/js/*.js'
  ]);
});

gulp.task('copy-css', function() {
  var data = false;
  gulp.src('./node_modules/medium-editor/dist/css/medium-editor.css')
    .pipe(gulp.dest('./app/css'))
    .on('data', function() { data = true; })
    .on('end', function() {
      if (!data) {
        console.error('medium-editor.css not found in node_modules');
        console.error('Please make sure Medium-Editor is installed through npm');
      }
      else { data = false; }
    });
  gulp.src('./node_modules/medium-editor/dist/css/themes/default.css')
    .pipe(gulp.dest('./app/css'))
    .on('data', function() { data = true; })
    .on('end', function() {
      if (!data) {
        console.error('default.css not found in node_modules');
        console.error('Please make sure Medium-Editor is installed through npm');
      }
      else { data = false; }
    });
});