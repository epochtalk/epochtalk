var gulp = require('gulp');
var del = require('del');
var livereload = require('gulp-livereload');
var shell = require('gulp-shell');
var nodemon = require('nodemon');
var path = require('path');
var runSequence = require('run-sequence');

require(path.join(__dirname, 'gulp', 'copy-css'));
require(path.join(__dirname, 'gulp', 'sass'));
require(path.join(__dirname, 'gulp', 'browserify'));

gulp.task('build', function(cb) {
  runSequence('clean', 'copy-css', 'sass', 'browserify', cb);
});

gulp.task('dev', function(cb) {
  runSequence('build', 'watch', 'nodemon', cb);
});

gulp.task('default', function() {
  return gulp.src('Procfile.dev', {read: false})
    .pipe(shell('foreman start -f <%= file.path %> -p 8080'));
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('app/**/*.{js,html,scss}', ['build']).on('change', livereload.changed);
  gulp.watch('public/**/*').on('change', livereload.changed);
  gulp.watch('server/**/*.js');
});

gulp.task('clean', function(cb) {
  del([
    'app/css/*.css',
    'app/scss/default.scss',
    'app/scss/medium-editor.scss',
    'app/scss/foundation/components',
    'app/scss/normalize.scss',
    'app/scss/foundation.scss',
    'public/js/*.js'
  ], cb);
});

gulp.task('nodemon', function() {
  nodemon(path.join(__dirname, 'server'));
});
