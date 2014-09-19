var path = require('path');
var gulp = require('gulp');
var browserify = require(path.join(__dirname, 'gulp', 'browserify'));
var watch = require('gulp-watch');

gulp.task('build', ['browserify']);
gulp.task('default', ['build']);
gulp.task('watch', function() {
  gulp.watch('app/**/*.{js,html}', ['build']);
  gulp.watch('server/**/*.js');
});

