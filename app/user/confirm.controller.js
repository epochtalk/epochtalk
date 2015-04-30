module.exports = ['$location', '$timeout', '$stateParams', 'User', 'Session', 'Alert',
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
      Alert.success('Account successfully confirmed, you will be redirected shortly...');
      $timeout(function() { $location.path('/'); }, 3000);
    })
    .catch(function(err) {
      Alert.error(err.data.message);
      $timeout(function() { $location.path('/'); }, 3000);
    });
  }
];
