module.exports = ['$location', '$timeout', '$stateParams', 'User', 'Session', function($location, $timeout, $stateParams, User, Session) {
  var ctrl = this;
  this.message = '';
  var params = {
    username: $stateParams.username,
    token: $stateParams.token
  };
  User.confirmAccount(params, function(user) {
    Session.setUser(user);
    ctrl.message = 'Account successfully confirmed, you will be redirected shortly...';
    $timeout(function() { $location.path('/'); }, 3000);
  },
  function(err) {
    ctrl.message = err.data.message;
    $timeout(function() { $location.path('/'); }, 3000);
  });
}];
