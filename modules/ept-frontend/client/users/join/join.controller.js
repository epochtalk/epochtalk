var ctrl = ['$rootScope', '$location', '$timeout', '$stateParams', 'User', 'Alert', 'Session',
  function($rootScope, $location, $timeout, $stateParams, User, Alert, Session) {
    var ctrl = this;
    this.joinUser = {
      hash: $stateParams.token,
      username: '',
      email: $stateParams.email,
      password: '',
      confirmation: ''
    };

    // check if hash/username is valid or expired
    this.register = function() {
      User.join(ctrl.joinUser).$promise
      .then(function(resource) { Session.setUser(resource); })
      .then(function() { $rootScope.$emit('loginEvent'); })
      .then(function() {
        Alert.success('Successfully Registered. Redirecting...');
        $timeout(function(){ $location.path('/'); }, 4000);
      })
      .catch(function(err) {
        if (err.status === 422) { Alert.warning('Your invitation is invalid, Redirecting.'); }
        else { Alert.error('Failed to join this forum'); }
        $timeout(function(){ $location.path('/'); }, 4000);
      });
    };
  }
];

module.exports = angular.module('ept.join.ctrl', [])
.controller('JoinCtrl', ctrl)
.name;
