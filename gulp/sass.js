var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('sass', function(cb) {
  gulp.src('./app/scss/app.scss')
    .pipe(sass())
    .pipe(gulp.dest('./app/css'))
    .on('end', function() { cb(); });
});
