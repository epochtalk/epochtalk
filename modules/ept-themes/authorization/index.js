var path = require('path');

module.exports = [
  {
    name: 'auth.themes.getTheme',
    method: require(path.normalize(__dirname + '/getTheme'))
  },
  {
    name: 'auth.themes.previewTheme',
    method: require(path.normalize(__dirname + '/previewTheme'))
  },
  {
    name: 'auth.themes.resetTheme',
    method: require(path.normalize(__dirname + '/resetTheme'))
  },
  {
    name: 'auth.themes.setTheme',
    method: require(path.normalize(__dirname + '/setTheme'))
  }
];
