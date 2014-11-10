module.exports = ['$location', '$timeout', '$route', 'tokenStatus', 'User', 'Auth', function($location, $timeout, $route, tokenStatus, User, Auth) {
  var ctrl = this;
  this.updatedUser = {};
  this.tokenExpired = false;
  this.tokenValid = false;
  this.status = {};

  tokenStatus.$promise
  .then(function(resource) {
    ctrl.tokenExpired = resource.token_expired;
    ctrl.tokenValid = resource.token_valid;
    if (!ctrl.tokenValid) {
      ctrl.redirectHome();
    }
    if (ctrl.tokenExpired) {
      ctrl.status = {};
      ctrl.status.message = 'Your reset password token has expired, you will be redirected shortly.';
      ctrl.status.type = 'warning';
      $timeout(function(){ ctrl.redirectHome(); }, 4000);
    }
  });

  this.resetPassword = function() {
    var user = {
      username: $route.current.params.username,
      password: ctrl.updatedUser.password,
      confirmation: ctrl.updatedUser.confirmation,
      token: $route.current.params.token
    };
    User.resetPassword(user).$promise
    .then(function() {
      ctrl.updatedUser = {};
      ctrl.status = {};
      ctrl.status.message = 'Successfully reset account password, you will be redirected shortly.';
      ctrl.status.type = 'success';
      delete user.token;
      delete user.confirmation;
      $timeout(function() {
        Auth.login(user, function() {
          ctrl.redirectHome();
        },
        function(err) {
          ctrl.status.message = err.data.message;
          ctrl.status.type = 'alert';
        });
      }, 4000);
    })
    .catch(function(err) {
      ctrl.status.message = err.data.message;
      ctrl.status.type = 'alert';
    });
  };

  this.hideStatus = function() {
    ctrl.status = {};
  };

  this.redirectHome = function() {
    $location.path('/');
  };
}];