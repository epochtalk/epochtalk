module.exports = ['$scope', '$location', '$rootScope', 'Auth', 'breadcrumbs',
  function($scope, $location, $rootScope, Auth, breadcrumbs) {
    $rootScope.breadcrumbs = breadcrumbs.get();
    $scope.user = {};
    $scope.validation = {
      register: {},
      username: {},
      email: {},
      password: {}
    };

    $scope.register = function() {
      if ($scope.validation.username.error ||
          $scope.validation.email.error ||
          $scope.validation.password.error) {
        $scope.validation.register.error = true;
        $scope.validation.register.message = 'There are still some errors';
        return;
      }
      else if (!$scope.user.username || $scope.user.username.length === 0 ||
               !$scope.user.email || $scope.user.email.length === 0 ||
               !$scope.user.password || $scope.user.password.length === 0 ||
               !$scope.user.confirmation || $scope.user.confirmation.length === 0) {
        $scope.validation.register.error = true;
        $scope.validation.register.message = 'There are some fields missing';
        return;
      }

      Auth.register($scope.user,
        function() { $location.path('/'); },
        function(err) {
          $scope.validation.register.error = true;
          $scope.validation.register.message = err.data.message;
        }
      );
    };

    $scope.checkUsername = function() {
      if (!$scope.user.username || $scope.user.username.length === 0) {
        $scope.validation.username.error = true;
        $scope.validation.username.success = false;
        $scope.validation.username.message = 'Username Needed';
        return;
      }

      Auth.checkUsername($scope.user.username,
        function(result) {
          if (!result.found) {
            // set green checkmark
            $scope.validation.username.success = true;
            $scope.validation.username.error = false;
            $scope.validation.username.message = '';
          }
          else {
            // set red x and error
            $scope.validation.username.error = true;
            $scope.validation.username.success = false;
            $scope.validation.username.message = 'Username is already taken';
          }
        },
        function(err) {
          // set red x and error
          $scope.validation.username.error = true;
          $scope.validation.username.success = false;
          $scope.validation.username.message = 'Err ... ummm.';
        }
      );
    };

    $scope.checkEmail = function() {
      if (!$scope.user.email || $scope.user.email.length === 0) {
        $scope.validation.email.error = true;
        $scope.validation.email.success = false;
        $scope.validation.email.message = 'Not a valid email address';
        return;
      }

      Auth.checkEmail($scope.user.email,
        function(result) {
          if (!result.found) {
            // set green checkmark
            $scope.validation.email.success = true;
            $scope.validation.email.error = false;
            $scope.validation.email.message = '';
          }
          else {
            // set red x and error
            $scope.validation.email.error = true;
            $scope.validation.email.success = false;
            $scope.validation.email.message = 'Email is already taken';
          }
        },
        function(err) {
          // set red x and error
          $scope.validation.email.error = true;
          $scope.validation.email.success = false;
          $scope.validation.email.message = 'Err ... ummm.';
        }
      );
    };

    $scope.checkPasswords = function() {
      if ( !$scope.user.password || $scope.user.password.length === 0 ||
           !$scope.user.confirmation || $scope.user.confirmation.length === 0 ||
          $scope.user.password !== $scope.user.confirmation) {
        // set red x and error
        $scope.validation.password.error = true;
        $scope.validation.password.success = false;
        $scope.validation.password.message = 'Password and Confirmation do not match.';
      }
      else {
        // set green checkmark
        $scope.validation.password.success = true;
        $scope.validation.password.error = false;
        $scope.validation.password.message = '';
      }
    };
  }
];
