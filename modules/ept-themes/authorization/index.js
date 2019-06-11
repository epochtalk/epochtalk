var path = require('path');

module.exports = [
  {
    name: 'auth.themes.getTheme',
    method: require(path.normalize(__dirname + '/getTheme')),
    options: { callback: false }
  },
  {
    name: 'auth.themes.previewTheme',
    method: require(path.normalize(__dirname + '/previewTheme')),
    options: { callback: false }
  },
  {
    name: 'auth.themes.resetTheme',
    method: require(path.normalize(__dirname + '/resetTheme')),
    options: { callback: false }
  },
  {
    name: 'auth.themes.setTheme',
    method: require(path.normalize(__dirname + '/setTheme')),
    options: { callback: false }
  }
];
