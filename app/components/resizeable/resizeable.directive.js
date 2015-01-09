module.exports = ['$document',
  function($document) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        var doc = $document;
        var body = doc[0].body;
        var destroyed = false;
        var clicked = false;
        var onHold = false;
        var setCursor = false;
        var newHeight;
        var maxHeight = body.clientHeight;
        element[0].style.height = '288px';

        var animate = function() {
          if (destroyed) { return; }
          requestAnimationFrame(animate);

          if (setCursor || onHold) { body.classList.add('resize-cursor'); }
          else { body.classList.remove('resize-cursor'); }
          if (!clicked) { return; }
          if (newHeight) { element[0].style.height = newHeight + 'px'; }
        };

        var onDown = function(e) {
          // calculate max height
          maxHeight = body.clientHeight;
          clicked = true; // trigger on clicked
          if (setCursor) { onHold = true; }
        };

        var onMove = function(e) {
          // set cursor
          var elementHeight = element[0].clientHeight + 10; // box border
          var verticalGap = maxHeight - elementHeight;
          verticalGap = verticalGap - e.clientY;
          if (verticalGap > -25 && verticalGap <= 0) { setCursor = true; }
          else { setCursor = false; }

          // change height of element
          if (clicked && onHold) {
            e.preventDefault();
            newHeight = maxHeight - e.clientY;
            if (newHeight > maxHeight - 25) { newHeight = maxHeight - 25; }
            if (newHeight < 288) { newHeight = 288; }
          }
          else { newHeight = undefined; }
        };

        var onUp = function(e) {
          onHold = false;
          setCursor = undefined; // reset cursor
          newHeight = undefined; // clear newHeight
          clicked = false; // trigger off clicked
        };

        animate();
        doc.on('mousedown', onDown);
        doc.on('mousemove', onMove);
        doc.on('mouseup', onUp);
        element.on('$destroy', function() {
          destroyed = true;
          doc.off('mousedown');
          doc.off('mousemove');
          doc.off('mouseup');
        });
      }
    };
  }
];