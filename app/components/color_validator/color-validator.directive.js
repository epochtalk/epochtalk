module.exports = [function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attr, ngModel) {
      scope.$watch(attr.ngModel, function(value) {
        function validColor(stringToTest) {
          // Do not allow these values
          if (stringToTest === '') { return false; }
          if (stringToTest === 'inherit') { return false; }
          if (stringToTest === 'transparent') { return false; }

          // Strict RGB Validation
          if (stringToTest.substring(0, 3).toLowerCase() === 'rgb') {
            if (stringToTest.substring(stringToTest.length-1) !== ')') { return false; } // check ending for closing paren
            var rgb = stringToTest.split('(')[1].split(')')[0].split(',');
            if (stringToTest.substring(0, 4).toLowerCase() === 'rgba' && rgb.length !== 4) { return false; } // rgba 4 args
            for (var x = 0; x < rgb.length; x++) {
              if (x === 3 && (rgb[x] < 0 || rgb[x] > 1)) { return false; } // opacity between 0-1
              if (rgb[x] < 0 || rgb[x] > 255) { return false; } // rgb between 0-255
            }
          }

          // Strict HSL Validation
          if (stringToTest.substring(0, 3).toLowerCase() === 'hsl') {
            if (stringToTest.substring(stringToTest.length-1) !== ')') { return false; } // check ending for closing paren
            var hsl = stringToTest.split('(')[1].split(')')[0].split(',');
            if (stringToTest.substring(0, 4).toLowerCase() === 'hsla' && hsl.length !== 4) { return false; } // hsla 4 args
            for (var i = 0; i < hsl.length; i++) {
              if (i === 3 && (hsl[i] < 0 || hsl[i] > 1)) { return false; } // opacity between 0-1
              if (i === 0 && (hsl[i] < 0 || hsl[i] > 360)) { return false; } // h between 0-360
              if ((i === 1 || i === 2) && (hsl[i].split('%')[0] < 0 || hsl[i].split('%')[0] > 100)) { return false; } // s and l between 0-255
            }
          }

          // Try to apply style to new image element and see if it sticks
          var image = new Image();
          image.style.color = 'rgb(0, 0, 0)';
          image.style.color = stringToTest;
          if (image.style.color !== 'rgb(0, 0, 0)') { return true; }
          image.style.color = 'rgb(255, 255, 255)';
          image.style.color = stringToTest;
          return image.style.color !== 'rgb(255, 255, 255)';
        }

        // Set validity of model depending on return state of validColor
        ngModel.$setValidity(attr.ngModel, validColor(value));
      });
    }
  };
}];
