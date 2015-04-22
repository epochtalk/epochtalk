module.exports = ['$timeout', function($timeout) {
  return {
    restrict: 'E',
    scope: {
      show: '=',
      onClose: '&'
    },
    replace: true,
    transclude: true,
    template: '<div class="reveal-modal" data-reveal>' +
              '<div ng-transclude></div></div>',
    link: function(scope, element) {
      scope.focus = false;

      function close() {
        $(document).off('close.fndtn.reveal', '[data-reveal]');
        scope.focus = false;
        scope.show = false;
        if (scope.form) {
          scope.form.$setPristine();
          scope.form.$setUntouched();
        }
        if (scope.onClose) { scope.onClose(); }
      }

      scope.$watch('show', function(show) {
        if (show) {
          $(element).foundation('reveal', 'open');
          $(document).on('close.fndtn.reveal', '[data-reveal]', close);
          scope.focus = true;
        }
        else { $(element).foundation('reveal', 'close'); }
      });
    }
  };
}];
