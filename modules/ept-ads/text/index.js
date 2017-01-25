var fs = require('fs');
var path = require('path');

var disclaimerFilePath = path.normalize(__dirname + '/disclaimer.txt');
var infoFilePath = path.normalize(__dirname + '/info.txt');

var disclaimerText = fs.readFileSync(disclaimerFilePath, 'utf8');
var infoText = fs.readFileSync(infoFilePath, 'utf8');

module.exports = {
  getDisclaimer: function() { return disclaimerText; },
  setDisclaimer: function(text) {
    // set locally
    disclaimerText = text;

    // write to disk
    fs.writeFileSync(disclaimerFilePath, text);
  },
  getInfo: function() { return infoText; },
  setInfo: function(text) {
    // set locally
    infoText = text;

    // save to disk
    fs.writeFileSync(infoFilePath, text);
  }
};
