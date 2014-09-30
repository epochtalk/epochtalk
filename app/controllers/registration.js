module.exports = ['$scope', '$location', '$rootScope', 'Auth', 'breadcrumbs',
  function($scope, $location, $rootScope, Auth, breadcrumbs) {
    $rootScope.breadcrumbs = breadcrumbs.get();
    $scope.user = {};
    $scope.validation = {};
    $scope.validation.register = {};
    $scope.validation.username = {};
    $scope.validation.email = {};
    $scope.validation.password = {};
    $scope.validation.confirmation = {};

    $scope.register = function() {
      Auth.register($scope.user,
        function() { $location.path('/'); },
        function(err) {
          $scope.validation.register.error = true;
          $scope.validation.register.classes = 'no-margin';
          $scope.validation.register.message = err.data.message;
        }
      );
    };

    $scope.checkUsername = function() {
      if (!$scope.user.username || $scope.user.username.length === 0) {
        return;
      }

      Auth.checkUsername($scope.user.username,
        function(result) {
          if (!result.found) {
            // set green checkmark
            $scope.validation.username.success = true;
            $scope.validation.username.error = false;
            $scope.validation.username.classes = '[success, label]';
            $scope.validation.username.message = '';
          }
          else {
            // set red x and error
            $scope.validation.username.error = true;
            $scope.validation.username.success = false;
            $scope.validation.username.classes = 'error';
            $scope.validation.username.message = 'Username is already taken';
          }
        },
        function(err) {
          // set red x and error
          $scope.validation.username.error = true;
          $scope.validation.username.success = false;
          $scope.validation.username.classes = 'error';
          $scope.validation.username.message = 'Err ... ummm.';
        }
      );
    };

    $scope.checkEmail = function() {
      if (!$scope.user.email || $scope.user.email.length === 0) {
        return;
      }


      Auth.checkEmail($scope.user.email,
        function(result) {
          if (!result.found) {
            // set green checkmark
            $scope.validation.email.success = true;
            $scope.validation.email.error = false;
            $scope.validation.email.classes = '[success, label]';
            $scope.validation.email.message = '';
          }
          else {
            // set red x and error
            $scope.validation.email.error = true;
            $scope.validation.email.success = false;
            $scope.validation.email.classes = 'error';
            $scope.validation.email.message = 'Email is already taken';
          }
        },
        function(err) {
          // set red x and error
          $scope.validation.email.error = true;
          $scope.validation.email.success = false;
          $scope.validation.email.classes = 'error';
          $scope.validation.email.message = 'Err ... ummm.';
        }
      );
    };
  }
];
