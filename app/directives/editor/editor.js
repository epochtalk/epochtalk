var medium = require('medium-editor');
var xbbcode = require('./xbbcode');
var fs = require('fs');

module.exports = function() {
  return {
    restrict: 'E',
    scope: {
      text: "=",
      saveText: '&'
    },
    link: function(scope, element, attrs, ctrl) {
      // Find relevant HTML Elements
      var htmlElement = element[0];
      // bbcode editor element
      var editorElement = htmlElement.getElementsByClassName('ee-bbcode-editor')[0];
      editorElement = angular.element(editorElement);
      // bbcode preview element
      var previewElement = htmlElement.getElementsByClassName('ee-bbcode-preview')[0];
      previewElement = angular.element(previewElement);

      // medium options
      var options = {
        "targetBlank":true,
        "buttonLabels":"fontawesome",
        "placeholder": ''
      };
      var editor = new medium(editorElement, options);

      // Medium Editor Event Bindings
      var onChange = function() {
        scope.$apply(function() {
          // process BBCode
          var processed = xbbcode.process({text: editorElement.html()}).html;
          previewElement.html(processed);
          scope.saveText({ text: editorElement.html() });
        });
      };

      // on load ng-model text to editor and preview
      editorElement.html(scope.text);
      var processed = xbbcode.process({text: editorElement.html()}).html;
      previewElement.html(processed);

      editorElement.on('input', onChange);
      editorElement.on('blur', onChange);
    },
    template: fs.readFileSync(__dirname + '/../../templates/editor.html')
  };
};
