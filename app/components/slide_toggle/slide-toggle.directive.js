module.exports = ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link: function($scope, $element, $attr) {
      var clientHeight = 0;

      // run in a timeout to allow element to load
      $timeout(function () {
        clientHeight = $element[0].clientHeight + 'px';
        $element.addClass('slide');

        $scope.$watch($attr.slideToggle, function(newState, oldState) {
          if (newState) {
            $element[0].style.maxHeight = clientHeight;
            $element.removeClass('closed').addClass('open');
          }
          else {
            $element[0].style.maxHeight = '';
            $element.removeClass('open').addClass('closed');
          }
        });
      });
    }
  };
}];
