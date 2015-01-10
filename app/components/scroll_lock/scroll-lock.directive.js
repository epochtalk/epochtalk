module.exports = ['$document', '$window',
  function($document, $window) {
    return {
      restrict: 'A',
      link: function($scope, $element) {

        var element = $element[0];

        var catchFunction = function(e) {
          if (e.type !== 'mousewheel') { return; }
          var scrollTop = element.scrollTop;
          var scrollHeight = element.scrollHeight;
          var delta = e.wheelDelta;
          var height = element.clientHeight;
          var maxScroll = scrollHeight - height;
          var newScroll = scrollTop + (-1 * delta);
          
          // clipping bottom and top scrolls
          if (newScroll < 0) { newScroll = 0; }
          if (newScroll > maxScroll) { newScroll = maxScroll; }

          // skip unnecessary scrolls
          if (scrollTop === newScroll) {
            e.stopPropagation();
            e.preventDefault();
            return;
          }

          $element.scrollTop(newScroll);
          e.stopPropagation();
          e.preventDefault();
        };

        $element.on('scroll touchmove mousewheel', catchFunction);
      }
    };
  }
];
