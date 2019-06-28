var ctrl = ['$location', '$timeout', '$stateParams', 'User', 'Session', 'Alert',
  function($location, $timeout, $stateParams, User, Session, Alert) {
    var ctrl = this;
    this.message = '';

    var params = {
      username: $stateParams.username,
      token: $stateParams.token
    };
    User.confirmAccount(params).$promise
    .then(function(user) {
      Session.setUser(user);
      ctrl.message = 'Account successfully confirmed, you will be redirected shortly...';
      Alert.success(ctrl.message);
      $timeout(function() { $location.path('/'); }, 3000);
    })
    .catch(function(err) {
      ctrl.message = err.data.message;
      Alert.error(ctrl.message);
      $timeout(function() { $location.path('/'); }, 3000);
    });
  }
];

module.exports = angular.module('ept.confirm.ctrl', [])
.controller('ConfirmCtrl', ctrl)
.name;
