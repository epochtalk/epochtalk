module.exports = ['$timeout', function($timeout) {
  return {
    restrict: 'AC',
    scope: { autoFocus: '=' },
    link: function(scope, element) {
      function focus() { element[0].focus(); }

      $timeout(focus, 300);

      scope.$watch('autoFocus', function(trigger) {
        if (trigger) { $timeout(focus, 300); }
      });
    }
  };
}];
