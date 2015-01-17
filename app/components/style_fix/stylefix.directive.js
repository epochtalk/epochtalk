module.exports = ['$timeout', '$compile', function($timeout, $compile) {
  return {
    restrict: 'A',
    link: function(scope, element, attributes) {
      var regex = /(class="bbcode-\S*")/ig;
      var regexFunction = function(styleString) {
        // remove bbcode-prefix
        var classString = styleString.replace('class="bbcode-', '');
        classString = classString.replace('"', '');

        if (classString.indexOf('color-_') === 0) {
          var colorCode = classString.replace('color-_', '');
          return 'ng-style="{ \'color\': \'#' + colorCode + '\' }"';
        }
        else if (classString.indexOf('color') === 0) {
          var color = classString.replace('color-', '');
          return 'ng-style="{ \'color\': \'' + color + '\' }"';
        }
        else if (classString.indexOf('bgcolor-_') === 0) {
          var bgColorCode = classString.replace('bgcolor-_', '');
          return 'ng-style="{ \'background-color\': \'#' + bgColorCode + '\' }"';
        }
        else if (classString.indexOf('bgcolor') === 0) {
          var bgColor = classString.replace('bgcolor-', '');
          return 'ng-style="{ \'background-color\': \'' + bgColor + '\' }"';
        }
        else if (classString.indexOf('text') === 0) {
          var dir = classString.replace('text-', '');
          return 'ng-style="{ \'text-align\': \'' + dir + '\' }"';
        }
        else if (classString.indexOf('list') === 0) {
          var type = classString.replace('list-', '');
          return 'ng-style="{ \'list-style-type\': \'' + type + '\' }"';
        }
        else if (classString.indexOf('shadow-_') === 0) {
          var shadowCode = classString.replace('shadow-_', '');
          shadowCode = shadowCode.replace(/_/gi, ' ');
          shadowCode = '#' + shadowCode;
          return 'ng-style="{ \'text-shadow\': \'' + shadowCode + '\' }"';
        }
        else if (classString.indexOf('shadow') === 0) {
          var shadow = classString.replace('shadow-', '');
          shadow = shadow.replace(/_/gi, ' ');
          return 'ng-style="{ \'text-shadow\': \'' + shadow + '\' }"';
        }
        else if (classString.indexOf('size') === 0) {
          var size = classString.replace('size-', '');
          return 'ng-style="{ \'font-size\': \'' + size + '\' }"';
        }
        else return styleString;
      };

      var styleFix = function(text) {
        if (!text) { text = ''; }
        var _text = text.replace(regex, regexFunction);
        if (!_text) { _text = text; }
        return _text;
      };

      $timeout(function () {
        element.html(styleFix(element.html()));
        $compile(element.contents())(scope);
      });

      scope.$watch(function() { return element.html(); },
        function(newValue) {
          if (newValue) {
            $timeout(function () {
              element.html(styleFix(element.html()));
              $compile(element.contents())(scope);
            });
          }
      });
    }
  };
}];