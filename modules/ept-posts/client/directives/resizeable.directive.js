var directive = ['$document',
  function($document) {
    return {
      restrict: 'A',
      scope: { resize: '=resizeable' },
      link: function(scope, element) {
        var doc = $document;
        var body = doc[0].body;
        var destroyed = false;
        var grabbed = false; // user intends to resize
        var bar;
        var spacer;
        var originalY;
        var originalHeight;
        var newHeight;
        var newSpacerHeight;

        function init() {
          destroyed = false;
          element.prepend('<div id="ec-bar" class="editor-container-bar hide-mobile"><div class="bar"></div></div>');
          spacer = angular.element(doc[0].getElementById('post-spacer'));
          doc.on('mousemove', onMove);
          doc.on('mouseup', onUp);
          bar = angular.element(doc[0].getElementById('ec-bar'));
          bar.on('mousedown', onDown);
          bar.on('mouseup', onUp);
        }

        function destroy() {
          destroyed = true;
          doc.off('mousedown');
          doc.off('mousemove');
          doc.off('mouseup');
          bar.off('mousedown');
          bar.off('mouseup');
          angular.element(doc[0].getElementById('ec-bar')).remove();
        }

        var animate = function() {
          if (destroyed || !grabbed) { return; }
          if (newHeight) {
            element[0].style.height = newHeight + 'px';
            if (spacer[0]) { spacer[0].style.height = newSpacerHeight + 'px'; }
          }
        };

        function onDown(e) {
          grabbed = true;
          originalY = e.clientY;
          originalHeight = element[0].clientHeight;
        }

        function onMove(e) {
          // change height of element
          if (grabbed) {
            e.preventDefault();
            var height = originalY - e.clientY;
            height = originalHeight + height;
            if (height > body.clientHeight - 25) { height = body.clientHeight; }
            var defaultHeight = element.data('default-height');
            if (defaultHeight !== undefined && height < defaultHeight) { height = defaultHeight; }
            else if (height < 288) { height = 288; }

            newHeight = height;
            newSpacerHeight = height - 113;
            requestAnimationFrame(animate);
          }
        }

        function onUp() {
          grabbed = false; // trigger off clicked
          newHeight = undefined; // clear newHeight
          newSpacerHeight = undefined;
        }

        scope.$on('$destroy', destroy);
        scope.$watch('resize', function(value) {
          if (value) {
            init();
            element[0].style.height = element.data('default-height') || '100vh';
          }
          else {
            destroy();
            element[0].style.height = '100%';
          }
        });
      }
    };
  }
];

module.exports = angular.module('ept.directives.resizeable', [])
.directive('resizeable', directive);
