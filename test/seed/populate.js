var Promise = require('bluebird');
var Bro = require('brototype');

module.exports = function(fixture) {
  var runtime = {};
  Object.keys(fixture.data).forEach(function(dataType) {
    runtime[dataType] = [];
  });
  return Promise.each(fixture.run, function(dataType) {
    return Promise.each(fixture.data[dataType], function(options) {
      return Promise.reduce(Object.keys(options), function(current, field) {
        current[field] = Bro(runtime).iCanHaz(options[field]) || options[field];
        return current;
      }, {})
      .then(function(options) {
        return fixture.methods[dataType](options).then(function(result) {
          runtime[dataType].push(result);
        });
      });
    });
  })
  .then(function(results) {
    return runtime;
  });
};
