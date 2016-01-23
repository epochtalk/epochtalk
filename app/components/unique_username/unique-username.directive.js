module.exports = ['User', '$q',
  function(User, $q) {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
        ctrl.$asyncValidators.unique = function(modelValue) {
          var originalUsername = attrs.uniqueUsername;

          // check if the input is empty
          if (ctrl.$isEmpty(modelValue)) {
            return $q.when();
          }

          // check if the input hasn't changed from the original
          if (originalUsername === modelValue) {
            return $q.when();
          }

          var def = $q.defer();

          // check against the backend to see if available
          User.checkUsername({username: modelValue},
            function(result) {
              if (result.found) { def.reject(); }
              else { def.resolve(); }
            },
            function() { def.reject(); }
          );

          return def.promise;
        };
      }
    };
  }
];
