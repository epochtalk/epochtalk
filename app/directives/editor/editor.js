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
      var rawEditorElement = htmlElement.getElementsByClassName('ee-bbcode-editor')[0];
      var editorElement = angular.element(rawEditorElement);
      // bbcode preview element
      var rawPreviewElement = htmlElement.getElementsByClassName('ee-bbcode-preview')[0];
      var previewElement = angular.element(rawPreviewElement);

      // medium options
      var options = {
        "targetBlank":true,
        "buttonLabels":"fontawesome",
        "placeholder": ''
      };
      var editor = new medium(editorElement, options);

      // Medium Editor Event Bindings
      var onChange = function() {
        // process BBCode
        var processed = xbbcode.process({text: editorElement.html()}).html;
        previewElement.html(processed);
        scope.saveText({ text: editorElement.html() });
      };

      // scoll binding
      var onEditorScroll = function() {
        var scrollTop = rawEditorElement.scrollTop;
        rawPreviewElement.scrollTop = scrollTop;
      };

      var onPreviewScroll = function() {
        var scrollTop = rawPreviewElement.scrollTop;
        rawEditorElement.scrollTop = scrollTop;
      };

      // on load ng-model text to editor and preview
      editorElement.html(scope.text);
      var processed = xbbcode.process({text: editorElement.html()}).html;
      previewElement.html(processed);

      editorElement.on('input', onChange);
      editorElement.on('blur', onChange);
      editorElement.on('scroll', onEditorScroll);
      previewElement.on('scroll', onPreviewScroll);
    },
    template: fs.readFileSync(__dirname + '/../../templates/editor.html')
  };
};
