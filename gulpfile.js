var gulp = require('gulp');
var browserify = require('./gulp/browserify');

gulp.task('build', ['browserify']);
gulp.task('default', ['build']);
