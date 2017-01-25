module.exports = ['User', '$q', function(User, $q) {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      if (ctrl && ctrl.$validators.email) {
        ctrl.$asyncValidators.unique = function(modelValue) {
          var originalEmail = attrs.uniqueEmail;

          // check if the input is empty
          if (ctrl.$isEmpty(modelValue)) {
            return $q.when();
          }

          // check if the input hasn't changed from the original
          if (originalEmail === modelValue) {
            return $q.when();
          }

          var def = $q.defer();

          // check against the backend to see if available
          User.checkEmail({email: modelValue},
            function(result) {
              if (result.found) { def.reject(); }
              else { def.resolve(); }
            },
            function() { def.reject(); }
          );

          return def.promise;
        };
      }
    }
  };
}];
