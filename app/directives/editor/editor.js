var medium = require('medium-editor');
var bbcodeParser = require('bbcode-parser');
var fs = require('fs');

module.exports = ['$timeout', '$http', 'S3ImageUpload', function($timeout, $http, s3ImageUpload) {
  return {
    restrict: 'E',
    scope: {
      body: '=',
      encodedBody: '=',
      reset: '=',
      focusEditor: '='
    },
    controller: function($scope, $element) {
      var inputElement = $element.find('input')[0];
      var footer = $element[0].getElementsByClassName('editor-footer')[0];
      var editor = $element[0].getElementsByClassName('editor-input')[0];
      $scope.openImagePicker = function(e) { inputElement.click(); };
      $scope.images = [];

      function insertText(text) {
        $(editor).focus();
        var sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
          var range = sel.getRangeAt(0);
          range.collapse(false);
          range.insertNode( document.createTextNode(text) );
        }
        $(editor).blur();
      }

      function upload(images) {
        // upload each image
        images.forEach(function(image) {
          var imageProgress = {
            status: "Initializing",
            name: image.name,
            progress: 0
          };
          $scope.images.push(imageProgress);

          // get policy for this image
          s3ImageUpload.policy(image.name)
          .then(function(policy) {
            imageProgress.id = policy.data.filename;
            imageProgress.status = "Starting";

            // upload image to s3
            return s3ImageUpload.upload(policy, image)
            .progress(function(percent) {
              imageProgress.progress = percent;
              imageProgress.status = "Uploading";
            })
            .success(function(url) {
              imageProgress.status = "Complete";
              imageProgress.url = url;
              insertText('[img]' + url + '[/img]');
            });
          })
          .catch(function() {
            imageProgress.status = "Failed";
          });
        });
      }

      // bind to changes in the image input
      // because angular can handle ng-change on input[file=type]
      angular.element(inputElement).bind('change', function() {
        // get all the images from the file picker
        var fileList = inputElement.files;
        var images = [];
        for (var i = 0; i < fileList.length; i++) {
          images.push(fileList[i]);
        }
        upload(images);
        inputElement.value = ""; // clear filelist for reuse
      });

      // drap and drop implementation
      footer.addEventListener("dragenter", dragenter, false);
      function dragenter(e) {
        e.stopPropagation();
        e.preventDefault();
      }

      footer.addEventListener("dragover", dragover, false);
      function dragover(e) {
        e.stopPropagation();
        e.preventDefault();
      }

      footer.addEventListener("drop", drop, false);
      function drop(e) {
        e.stopPropagation();
        e.preventDefault();

        var dt = e.dataTransfer;
        var fileList = dt.files;
        var images = [];
        for (var i = 0; i < fileList.length; i++) {
          var file = fileList[i];
          if (!file.type.match(/image.*/)) { continue; }
          images.push(file);
        }
        upload(images);
      }
    },
    link: function(scope, element, attrs, ctrl) {
      // Find relevant HTML Elements
      var htmlElement = element[0];
      // bbcode editor element
      var rawEditorElement = htmlElement.getElementsByClassName('editor-input')[0];
      var editorElement = angular.element(rawEditorElement);
      // bbcode preview element
      var rawPreviewElement = htmlElement.getElementsByClassName('editor-preview')[0];
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
        var simpleText = editorElement.text();
        if (simpleText.length === 0) { rawText = ''; }

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

      // autofocus switch
      scope.$watch('focusEditor', function(focusEditor) {
        if (focusEditor === true) {
          $(rawEditorElement).focus();
        }
      });
    },
    template: fs.readFileSync(__dirname + '/../../templates/directives/editor.html')
  };
}];
