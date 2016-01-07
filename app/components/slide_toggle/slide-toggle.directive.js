module.exports = ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {
      // add slide class to element
      $element.addClass('slide');

      // watch for changes
      $timeout(function() {
        $scope.$watch($attr.slideToggle, function(newState, oldState) {
          var wrapperHeight = $element[0].querySelector('.slide-wrapper').clientHeight + 'px';

          if (newState) {
            $element[0].style.maxHeight = wrapperHeight;
            $element.removeClass('closed').addClass('open');
            $timeout(function() { $element[0].style.maxHeight = 'inherit'; }, 100);
          }
          else {
            if ($element[0].clientHeight === 0) { return; }
            $element[0].style.maxHeight = wrapperHeight;
            $timeout(function() {
              $element[0].style.maxHeight = '0';
              $element.removeClass('open').addClass('closed');
            });
          }
        });
      });
    }
  };
}];
