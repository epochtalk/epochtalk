var medium = require('medium-editor');
var bbcodeParser = require('bbcode-parser');
var fs = require('fs');

module.exports = function() {
  return {
    restrict: 'E',
    scope: {
      body: '=',
      encodedBody: '@'
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
        var rawText = editorElement.html();
        var processed = bbcodeParser.process({text: rawText}).html;
        previewElement.html(processed);
        if (rawText === '<p><br></p>' || rawText === '<p><br>""</p>') {
          rawText = '';
        }
        scope.body = rawText;
        scope.$apply();
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

      // on load ng-model body to editor and preview
      if (scope.encodedBody && scope.encodedBody.length > 0) {
        editorElement.html(scope.encodedBody);
      }
      else { editorElement.html(scope.body); }
      var processed = bbcodeParser.process({text: editorElement.html()}).html;
      previewElement.html(processed);

      editorElement.on('input', onChange);
      editorElement.on('blur', onChange);
      editorElement.on('scroll', onEditorScroll);
      previewElement.on('scroll', onPreviewScroll);
    },
    template: fs.readFileSync(__dirname + '/../../templates/directives/editor.html')
  };
};
