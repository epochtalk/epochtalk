var directive = ['$timeout', function($timeout) {
  return {
    restrict: 'CA',
    link: function(scope, element) {
      var numTries = 0;
      var src = element[0].src;

      var loaded = function() {
        $(element[0]).addClass('loaded');
        element.parent().addClass('loaded');
        numTries = 0;
      };

      var unload = function() {
        $(element[0]).removeClass('loaded');
        element.parent().removeClass('loaded');
      };

      // loading image  container
      var container = '<div class="imageContainer"></div>';
      element.wrap(container);

      // on image load
      element.on('load', function() { loaded(); });

      // on image error retry
      element.on('error', function() {
        unload();
        var currentSrc = $(element[0]).attr('ng-src') || element[0].src || src;

        $timeout(function() {
          if (numTries < 5) {
            element[0].src = currentSrc;
            numTries++;
          }
          else { loaded(); }
        }, 5000);
      });

      // bypass loading for gifs
      if (src.indexOf('.gif', src.length - '.gif'.length) !== -1) {
        loaded();
      }

      // on $destroy
      scope.$on('$destroy', function() {
        element.off('load');
        element.off('error');
      });
    }
  };
}];

angular.module('ept').directive('imageLoader', directive);
