module.exports = ['$document',
  function($document) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        var body = $document[0].body;

        element.on('mouseenter', function() {
          body.classList.add('body-scroll-lock');
        });

        element.on('mouseleave', function() {
          body.classList.remove('body-scroll-lock');
        });

        element.on('$destroy', function() {
          body.classList.remove('body-scroll-lock');
          element.off('mouseenter');
          element.off('mouseleave');
        });
      }
    };
  }
];