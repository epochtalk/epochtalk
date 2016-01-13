module.exports = ['$compile', 'templateHooks', function($compile, templateHooks) {
  return {
    restrict: 'E',
    scope: { hook: '@' },
    link: function($scope, $element, $attr) {
      var plugins = templateHooks[$scope.hook];
      if (!plugins) { return; }

      var template = '';
      plugins.forEach(function(plugin) {
        template += '<' + plugin + ' />';
      });

      var compiled = $compile(template)($scope);
      $element.append(compiled);
    }
  };
}];
