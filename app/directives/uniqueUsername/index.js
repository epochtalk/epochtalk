module.exports = ['Auth', '$q', '$timeout',
  function(Auth, $q, $timeout) {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
        ctrl.$asyncValidators.unique = function(modelValue, viewValue) {
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
          Auth.checkUsername(modelValue,
            function(result) {
              if (result.found) { def.reject(); }
              else { def.resolve(); }
            },
            function(err) { def.reject(); }
          );

          return def.promise;
        };
      }
    };
  }
];