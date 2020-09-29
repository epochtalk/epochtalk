module.exports = ['$document', '$timeout', function($document, $timeout) {
  return {
    restrict: 'E',
    scope: {
      show: '=',
      onClose: '&'
    },
    replace: true,
    transclude: true,
    template:
    '<div class="ng-modal" ng-show="show">' +
      '<div class="ng-modal-overlay" ng-click="close()"></div>' +
      '<div class="ng-modal-dialog" ng-style="dialogStyle">' +
        '<div class="ng-modal-close" ng-click="close()"><svg enable-background="new 0 0 16 16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="m12.7 5.2-1.2-1.2-3.1 3.2-3.2-3.2-1.2 1.2 3.2 3.2-3.2 3.1 1.2 1.2 3.2-3.2 3.1 3.2 1.2-1.2-3.2-3.1z" fill-rule="evenodd"/></svg></div>' +
        '<div class="ng-modal-dialog-content" ng-transclude></div>' +
      '</div>' +
    '</div>',
    link: function(scope) {
      scope.listener = false;
      scope.focus = false;
      scope.close = function() {
        $timeout(function() {
          scope.focus = false;
          scope.show = false;
          if (scope.form) {
            scope.form.$setPristine();
            scope.form.$setUntouched();
          }
          if (scope.onClose) { scope.onClose(); }
          $document[0].body.style.overflow = 'hidden auto';
          if(scope.listener) {
            $(document).off('keydown');
            scope.listener = false;
          }
        });
      };
      scope.$watch('show', function(show) {
        if (show) {
          scope.focus = true;
          $document[0].body.style.overflow = 'hidden hidden';
          if (!scope.listener) {
            $(document).on('keydown', function(e) {
              if (e.which == 27 && scope.show) { scope.close(); }
            });
          }
        }
        else {
          scope.close();
        }
      });
    }
  };
}];
