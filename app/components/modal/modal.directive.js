module.exports = ['$timeout', function($timeout) {
  return {
    restrict: 'E',
    scope: {
      show: '=',
      onClose: '='
    },
    replace: true,
    transclude: true,
    template: '<div class="reveal-modal" data-reveal>' +
      '<div ng-transclude></div>'+
      '</div>',
    link: function(scope, element) {
      scope.$watch('show', function(show) {
        if (show) {
          $(element).foundation('reveal', 'open');
          $(document).on('close.fndtn.reveal', '[data-reveal]', function () {
            scope.show = false;
            $timeout(function() { scope.$apply(); });
            $(document).off('close.fndtn.reveal', '[data-reveal]');
            if (typeof scope.onClose === 'function') { scope.onClose(); }
          });
        }
        else {
          $(element).foundation('reveal', 'close');
        }
      });
    }
  };
}];
