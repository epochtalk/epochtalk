var path = require('path');

module.exports = function(options) {
  return [
    require(path.normalize(__dirname + '/localUpload'))(options.config),
    require(path.normalize(__dirname + '/uploadPolicy'))
  ];
};
