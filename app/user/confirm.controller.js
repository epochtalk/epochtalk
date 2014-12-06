module.exports = ['$location', '$timeout', '$stateParams', 'Auth', function($location, $timeout, $stateParams, Auth) {
  var ctrl = this;
  this.message = '';

  var params = {
    username: $stateParams.username,
    token: $stateParams.token
  };

  Auth.confirmAccount(params, function() {
    ctrl.message = 'Account successfully confirmed, you will be redirected shortly...';
    $timeout(function() { $location.path('/boards'); }, 3000);
  }, function(err) {
    ctrl.message = err.data.message;
    $timeout(function() { $location.path('/boards'); }, 3000);
  });
}];
