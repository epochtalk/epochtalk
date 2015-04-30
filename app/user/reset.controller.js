module.exports = ['$location', '$timeout', '$stateParams', 'User', 'Auth', 'Alert',
  function($location, $timeout, $stateParams, User, Auth, Alert) {
    var ctrl = this;
    this.tokenExpired = false;
    this.resetUser = {
      username: $stateParams.username,
      token: $stateParams.token
    };

    // check if token/username is valid or expired
    var checkUser = {
      username: ctrl.resetUser.username,
      token: ctrl.resetUser.token
    };
    User.checkResetToken(checkUser).$promise
    .then(function(res) {
      ctrl.tokenExpired = res.token_expired;
      if (!res.token_valid) { $location.path('/'); }
      if (ctrl.tokenExpired) {
        Alert.warning('Your reset password token has expired, you will be redirected shortly.');
        $timeout(function(){ $location.path('/'); }, 4000);
      }
    });

    this.resetPassword = function() {
      User.resetPassword(ctrl.resetUser).$promise
      .then(function() {
        Alert.success('Successfully reset account password, you will be redirected shortly.');
        var loginUser = {
          username: ctrl.resetUser.username,
          password: ctrl.resetUser.password
        };
        $timeout(function() {
          Auth.login(loginUser)
          .then(function() { $location.path('/'); })
          .catch(function(err) { Alert.error(err.data.message); });
        }, 4000);
      })
      .catch(function(err) { Alert.error(err.data.message); });
    };
  }
];
