var gulp = require('gulp');
var del = require('del');
var livereload = require('gulp-livereload');
var shell = require('gulp-shell');
var nodemon = require('nodemon');
var path = require('path');
require(path.join(__dirname, 'gulp', 'sass'));
require(path.join(__dirname, 'gulp', 'browserify'));

gulp.task('build', ['clean', 'copy-css', 'sass', 'browserify']);
gulp.task('dev', ['build', 'watch', 'nodemon']);
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

gulp.task('nodemon', function() {
  nodemon(path.join(__dirname, 'server'));
});
