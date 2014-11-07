module.exports = ['$scope', '$location', 'Auth',
  function($scope, $location, Auth) {
    var ctrl = this;

    // TODO: possibly a better way to watch for if the user logs in
    $scope.$watch(function(){
      return Auth.isAuthenticated();
    }, function (loggedIn) {
      // Dont let users see this page if they're logged in
      if (loggedIn) {
        $location.path('/');
      }
    });

    this.user = {};
    this.error = {};

    this.submit = function(keyEvent) {
      if (keyEvent.which === 13) {
        ctrl.register();
      }
    };

    this.register = function() {
      ctrl.error = {};

      Auth.register(this.user,
        function() { $location.path('/'); },
        function(err) {
          ctrl.error.status = true;
          ctrl.error.message = err.data.message;
        }
      );
    };
  }
];
