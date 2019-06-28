var path = require('path');
var customPath = '/../../../content/sass/_custom-variables.scss';
var varsDir = '/../../../app/scss/ept/variables';

module.exports = {
  customVarsPath: path.normalize(__dirname + customPath),
  previewVarsPath: path.normalize(__dirname + varsDir + '/_preview-variables.scss'),
  defaultVarsPath: path.normalize(__dirname + varsDir + '/_default-variables.scss')
};
