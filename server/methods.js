var path = require('path');
var config = require(path.normalize(__dirname + '/../config'));

module.exports = [
  {
    name: 'viewable',
    options: { callback: false },
    method: function(request) {
      var viewable = true;
      if (config.loginRequired) { viewable = request.auth.isAuthenticated; }
      return viewable;
    }
  }
];
