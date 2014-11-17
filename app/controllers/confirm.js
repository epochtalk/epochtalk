module.exports = ['$location', '$timeout', '$route', 'Auth', function($location, $timeout, $route, Auth) {
  var ctrl = this;
  this.message = '';

  var params = {
    username: $route.current.params.username,
    token: $route.current.params.token
  };

  Auth.confirmAccount(params, function() {
    ctrl.message = 'Account successfully confirmed, you will be redirected shortly...';
    $timeout(function() { $location.path('/boards'); }, 3000);
  }, function(err) {
    ctrl.message = err.data.message;
    $timeout(function() { $location.path('/boards'); }, 3000);
  });
}];