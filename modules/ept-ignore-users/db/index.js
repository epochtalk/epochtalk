var path = require('path');

module.exports = {
  ignore: require(path.normalize(__dirname + '/ignore')),
  unignore: require(path.normalize(__dirname + '/unignore')),
  isIgnored: require(path.normalize(__dirname + '/isIgnored')),
  ignored: require(path.normalize(__dirname + '/ignored'))
};
