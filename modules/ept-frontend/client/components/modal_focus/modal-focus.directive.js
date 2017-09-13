module.exports = ['$timeout', function($timeout) {
  return {
    link: function (scope, element, attr) {

      attr.$observe('modalFocus', function (value) {
        if (value === 'true') {
          $timeout(function () {
            var tagName = element[0].tagName;
            if (tagName === 'INPUT' || tagName === 'TEXTAREA') { element[0].focus(); }
            else {
              var nestedInput = element[0].querySelector('input');
              if (nestedInput) { nestedInput.focus(); }
            }
          });
        }
      });

    }
  };
}];
