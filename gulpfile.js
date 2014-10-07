var path = require('path');
var gulp = require('gulp');
var browserify = require(path.join(__dirname, 'gulp', 'browserify'));
var watch = require('gulp-watch');
var livereload = require('gulp-livereload');

gulp.task('build', ['browserify']);
gulp.task('default', ['build']);
gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('app/**/*.{js,html,css}', ['build']).on('change', livereload.changed);
  gulp.watch('public/**/*').on('change', livereload.changed);
  gulp.watch('server/**/*.js');
});

