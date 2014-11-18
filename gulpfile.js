var gulp = require('gulp');
var del = require('del');
var livereload = require('gulp-livereload');
var shell = require('gulp-shell');
var nodemon = require('nodemon');
var path = require('path');
var runSequence = require('run-sequence');
var rename = require('gulp-rename');

require(path.join(__dirname, 'gulp', 'sass'));
require(path.join(__dirname, 'gulp', 'browserify'));

gulp.task('build', function(cb) {
  runSequence('clean', 'copy-css', function() {
    setTimeout(function() {
      runSequence('sass', 'browserify', cb);
    }, 400);
  });
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

gulp.task('clean', function() {
  del([
    'app/css/*.css',
    'app/scss/default.scss',
    'app/scss/medium-editor.scss',
    'app/scss/foundation/components',
    'app/scss/normalize.scss',
    'app/scss/foundation.scss',
    'public/js/*.js'
  ]);
});

gulp.task('copy-css', function() {
    var data = false;
    gulp.src('./node_modules/foundation/scss/foundation/components/*.scss')
      .pipe(gulp.dest('./app/scss/foundation/components'))
      .on('data', function() { data = true; })
      .on('end', function() {
        if (!data) {
          console.error('Foundation not found in node_modules');
          return console.error('Please make sure Foundation is installed through npm install');
        }
        else { data = false; }
      });
    gulp.src('./node_modules/foundation/scss/*.scss')
      .pipe(gulp.dest('./app/scss'))
      .on('data', function() { data = true; })
      .on('end', function() {
        if (!data) {
          console.error('Foundation not found in node_modules');
          return console.error('Please make sure Foundation is installed through npm install');
        }
        else { data = false; }
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
        else { data = false; }
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
        else { data = false; }
      });
});

gulp.task('nodemon', function() {
  nodemon(path.join(__dirname, 'server'));
});
