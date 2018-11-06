module.exports = [function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, element, attr, ngModel) {
      function into(input) {
        try {
         return JSON.parse(input);
        } catch(e) {}
      }
      function out(data) {
        try {
          return JSON.stringify(data, null, 2);
        } catch(e) {}
      }
      ngModel.$parsers.push(into);
      ngModel.$formatters.push(out);
    }
  };
}];
