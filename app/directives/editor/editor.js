var medium = require('medium-editor');
var bbcodeParser = require('bbcode-parser');
var fs = require('fs');

module.exports = ['$timeout', function($timeout) {
  return {
    restrict: 'E',
    scope: {
      body: '=',
      encodedBody: '=',
      reset: '='
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

      // Medium Editor and options
      var options = {
        "targetBlank":true,
        "buttonLabels":"fontawesome",
        "placeholder": ''
      };
      var editor = new medium(editorElement, options);

      // converts encoded unicode into numeric representation
      function textToEntities(text) {
        var entities = "";
        for (var i = 0; i < text.length; i++) {
          if (text.charCodeAt(i) > 127) {
            entities += "&#" + text.charCodeAt(i) + ";";
          }
          else { entities += text.charAt(i); }
        }

        return entities;
      }

      function parseInput() {
        // get raw user input
        var rawText = editorElement.html();
        // at this point, special characters are escaped: < > &

        // replaces &, <, >
        rawText = rawText.replace(/&amp;/g, '&');
        rawText = rawText.replace(/&gt;/g, '&#62;');
        rawText = rawText.replace(/&lt;/g, '&#60;');

        // convert all unicode characters to their numeric representation
        // this is so we can save it to the db and present it to any encoding
        rawText = textToEntities(rawText);

        // parse bbcode and bind to preview
        var processed = bbcodeParser.process({text: rawText}).html;
        previewElement.html(processed);

        // medium always leaves input dirty even if there's no input
        // this will clean it
        if (rawText === '<p><br></p>' || rawText === '<p><br>""</p>') {
          rawText = '';
        }

        // re-bind to scope
        scope.body = processed;
        scope.encodedBody = rawText;
        scope.$apply();
      }

      // Medium Editor Event Bindings
      var debounce;
      var onChange = function() {
        $timeout.cancel(debounce);
        debounce = $timeout(function() {
          parseInput();
        }, 250);
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

      // bind all the things
      editorElement.on('input', onChange);
      editorElement.on('blur', onChange);
      editorElement.on('scroll', onEditorScroll);
      previewElement.on('scroll', onPreviewScroll);

      // directive initialization 
      var init = function() {
        // on load ng-model body to editor and preview
        if (scope.encodedBody && scope.encodedBody.length > 0) {
          editorElement.html(scope.encodedBody);
        }
        else { editorElement.html(scope.body); }
        var processed = bbcodeParser.process({text: editorElement.html()}).html;
        previewElement.html(processed);
      };
      init();
      
      // reset switch
      scope.$watch('reset', function(newValue, oldValue) {
        if (newValue === true) {
          init();
          scope.reset = false;
        }
      });
    },
    template: fs.readFileSync(__dirname + '/../../templates/directives/editor.html')
  };
}];
