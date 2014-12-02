var path = require('path');
var _ = require('lodash');

module.exports = [function() {
    var fs = require('fs');
    var getMostRecentFileName = function(dir) {
      var files = fs.readdirSync(dir);
      return _.max(files, function (f) {
        var fullpath = path.join(dir, f);
        return fs.statSync(fullpath).ctime;
      });
    };

    this.log = '';

    var logPath = path.join(__dirname, '..', '..', '..', 'logs', 'server', 'requests');
    var latestLog = getMostRecentFileName(logPath);
    this.log = latestLog;
  }
];
