module.exports = [function() {
  return {
    restrict: 'A',
    link: function(scope, element, attributes) {
      var duration = attributes.slideToggleDuration || 'fast';
      scope.$watch(attributes.slideToggle, function(newState, oldState) {
        if (newState === oldState) { return; }
        if (newState) {
          $(element).stop(true, true).slideUp(duration);
        }
        else {
          $(element).stop(true, true).slideDown(duration);
        }
      });
    }
  };
}];