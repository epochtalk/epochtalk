module.exports = ['$timeout', '$filter', function($timeout, $filter) {
  return {
    restrict: 'A',
    link: function(scope, element, attributes) {
      var regex = /(ept-date=[0-9]+)/ig;
      var regexFunction = function(timeString) {
        timeString = timeString.replace('ept-date=', '');
        var dateNumber = Number(timeString) || 0;
        var date = new Date(dateNumber);

        var now = new Date();
        var isToday = now.toDateString() === date.toDateString();
        var isThisYear = now.getYear() === date.getYear();
        if (isToday) {
          date = 'Today at ' +  $filter('date')(date, 'h:mm:ss a');
        }
        else if (isThisYear) {
          date = $filter('date')(date, 'MMMM d, h:mm:ss a');
        }
        else {
          date = $filter('date')(date, 'MMM d, y, h:mm:ss a');
        }
        return date;
      };

      var autoDate = function(text) {
        if (!text) { text = ''; }
        var _text = text.replace(regex, regexFunction);
        if (!_text) { _text = text; }
        return _text;
      };

      $timeout(function () { element.html(autoDate(element.html())); });

      scope.$watch(function() { return element.text(); }, function(newValue) {
        if (newValue) {
          $timeout(function () { element.html(autoDate(element.html())); });
        }
      });
    }
  };
}];