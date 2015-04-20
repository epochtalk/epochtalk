module.exports = ['$location', '$timeout', '$stateParams', 'User', 'Auth', function($location, $timeout, $stateParams, User, Auth) {
  var ctrl = this;
  this.updatedUser = {};
  this.tokenExpired = false;
  this.tokenValid = false;
  this.status = {};

  var params = {
    username: $stateParams.username,
    token: $stateParams.token
  };

  User.checkResetToken(params, function(res) {
    ctrl.tokenExpired = res.token_expired;
    ctrl.tokenValid = res.token_valid;
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
      username: $stateParams.username,
      password: ctrl.updatedUser.password,
      confirmation: ctrl.updatedUser.confirmation,
      token: $stateParams.token
    };
    User.resetPassword(user, function() { // success
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
    },
    function(err) { // error
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
