var path = require('path');
var config = require(path.normalize(__dirname + '/../config'));
var loginRequired = config.loginRequired;

module.exports = [
  {
    name: 'viewable',
    options: { callback: false },
    method: function(request) {
      var viewable = true;
      if (loginRequired) { viewable = request.auth.isAuthenticated; }
      return viewable;
    }
  }
];
