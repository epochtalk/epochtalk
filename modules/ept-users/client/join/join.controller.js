var ctrl = ['$rootScope', '$location', '$timeout', '$stateParams', 'User', 'Auth', 'Alert', 'Session',
  function($rootScope, $location, $timeout, $stateParams, User, Auth, Alert, Session) {
    var ctrl = this;

    // For the odd case when a user is authenticated already and they
    // click on an invite link. Log the user out and refresh the view
    if (Session.isAuthenticated()) {
      Auth.logout()
      .then(function() {
        $state.go($state.current, $stateParams, { reload: true });
      });
    }

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
