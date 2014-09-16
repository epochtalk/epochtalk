var path = require('path');
var gulp = require('gulp');
var browserify = require(path.join(__dirname, 'gulp', 'browserify'));
var uglify = require(path.join(__dirname, 'gulp', 'uglify'));

gulp.task('build', ['browserify']);
gulp.task('default', ['build']);
