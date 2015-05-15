module.exports = ['$document',
  function($document) {
    return {
      restrict: 'A',
      scope: { resize: '=resizeable' },
      link: function(scope, element) {
        var doc = $document;
        var body = doc[0].body;
        var destroyed = false;
        var grabbed = false; // user intends to resize
        var newHeight;
        var maxHeight = body.clientHeight;

        function init() {
          destroyed = false;
          element.prepend('<div class="editor-container-bar"><div class="bar"></div></div>');
          animate();
          doc.on('mousedown', onDown);
          doc.on('mousemove', onMove);
          doc.on('mouseup', onUp);
        }

        function destroy() {
          destroyed = true;
          doc.off('mousedown');
          doc.off('mousemove');
          doc.off('mouseup');
          $('.editor-container-bar').remove();
        }

        var animate = function() {
          if (destroyed || !grabbed) { return; }
          if (newHeight) { element[0].style.height = newHeight + 'px'; }
        };

        var elementHeight;
        var verticalGap;
        var onDown = function(e) {
          // calculate max height
          maxHeight = body.clientHeight;
          elementHeight = element[0].clientHeight + 10; // box border
          verticalGap = maxHeight - elementHeight;
          verticalGap = verticalGap - e.clientY;
          if (verticalGap > -25 && verticalGap <= 0) { grabbed = true; }
          else { grabbed = false; }
        };

        var onMove = function(e) {
          // change height of element
          if (grabbed) {
            e.preventDefault();
            newHeight = maxHeight - e.clientY;
            if (newHeight > maxHeight - 25) { newHeight = maxHeight; }
            if (newHeight < 288) { newHeight = 288; }
            requestAnimationFrame(animate);
          }
        };

        var onUp = function(e) {
          grabbed = false; // trigger off clicked
          newHeight = undefined; // clear newHeight
        };

        scope.$on('$destroy', destroy);
        scope.$watch('resize', function(value) {
          if (value) {
            init();
            element[0].style.height = '288px';
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
