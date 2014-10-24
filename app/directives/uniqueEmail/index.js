module.exports = ['Auth', '$q', '$timeout',
  function(Auth, $q, $timeout) {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
        if (ctrl && ctrl.$validators.email) {
          ctrl.$asyncValidators.uniqueEmail = function(modelValue, viewValue) {
            var def = $q.defer();
            var originalEmail = attrs.uniqueEmail;

            // check if the input is empty
            if (ctrl.$isEmpty(modelValue)) {
              ctrl.$setValidity('noEmail', false);
              return $q.when();
            }
            else {
              ctrl.$setValidity('noEmail', true);
            }

            // check if the input hasn't changed from the original
            if (originalEmail === modelValue) {
              ctrl.$setValidity('sameEmail', false);
              return $q.when();
            }
            else {
              ctrl.$setValidity('sameEmail', true);
            }

            // check against the backend to see if available
            Auth.checkEmail(modelValue,
              function(result) {
                if (result.found) { def.reject(); }
                else { def.resolve(); }
              },
              function(err) { def.reject(); }
            );

            return def.promise;
          };
        }
      }
    };
  }
];