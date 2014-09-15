/* browserify task
   ---------------
   Bundle javascripty things with browserify!

   If the watch task is running, this uses watchify instead
   of browserify for faster bundling using caching.
*/

var gulp         = require('gulp');
var browserify   = require('browserify');
var watchify     = require('watchify');
var source       = require('vinyl-source-stream');

gulp.task('browserify', function() {
  var bundler = browserify({
    // cache: {}, packageCache: {}, fullPaths: true,
    // Specify the entry point of your app
    entries: ['./app/app.js'],
    // Enable source maps!
    debug: true
  });

  var bundle = function() {
    // Log when bundling starts

    return bundler
      .transform('cssify')
      .transform('brfs')
      .transform('browserify-ngmin')
      .bundle()
      // Report compile errors
      .on('error', console.log)
      // Use vinyl-source-stream to make the
      // stream gulp compatible. Specifiy the
      // desired output filename here.
      .pipe(source('bundle.js'))
      // Specify the output destination
      .pipe(gulp.dest('./public/js/'))
      // Log when bundling completes!
      .on('end', console.log);
  };

  if(global.isWatching) {
    bundler = watchify(bundler);
    // Rebundle with watchify on changes.
    bundler.on('update', bundle);
  }

  return bundle();
});
