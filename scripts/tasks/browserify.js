var fs = require('fs');
var browserify = require('browserify');
var watchify = require('watchify');

module.exports = function(watch, callback) {
  if (!callback) { callback = function(){}; }

  console.log('Starting Browserify...');

  var bundler = browserify({
    entries: ['./app/app.js'],
    debug: true // Enable source maps!
  });

  var output = fs.createWriteStream('./public/js/bundle.js');
  output.on('error', callback);
  output.on('finish', function() {
    console.log('Browserify Done.');
    return callback();
  });

  if (watch) {
    bundler = watchify(bundler);
    bundler.on('update', function() {
      bundler.bundle(function(err, data) {
        fs.writeFile('./public/js/bundle.js', data, function(err) {
          if (err) { return console.log(err); }
          console.log('Bundle Updated.');
        });
      });
    });
  }

  bundler
  .transform('brfs')
  .bundle()
  .on('error', callback)
  .pipe(output);
};
