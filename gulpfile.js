var path = require('path');
var gulp = require('gulp');
var browserify = require(path.join(__dirname, 'gulp', 'browserify'));

gulp.task('build', ['browserify']);
gulp.task('default', ['build']);
