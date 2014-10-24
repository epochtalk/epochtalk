module.exports = ['Auth', '$q', '$timeout',
  function(Auth, $q, $timeout) {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
        ctrl.$asyncValidators.username = function(modelValue, viewValue) {
          var def = $q.defer();
          var originalUsername = attrs.uniqueUsername;

          // check if the input is empty
          if (ctrl.$isEmpty(modelValue)) {
            ctrl.$setValidity('noUsername', false);
            return $q.when();
          }
          else {
            ctrl.$setValidity('noUsername', true);
          }

          // check if the input hasn't changed from the original
          if (originalUsername === modelValue) {
            ctrl.$setValidity('sameUsername', false);
            return $q.when();
          }
          else {
            ctrl.$setValidity('sameUsername', true);
          }

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