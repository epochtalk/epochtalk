var medium = require('medium-editor');
var bbcodeParser = require('bbcode-parser');
var fs = require('fs');

module.exports = ['$timeout', '$http', function($timeout, $http) {
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
      $scope.imageUrl = '';
      $scope.imageUploading = false;
      $scope.imageComplete = false;
      $scope.openImagePicker = function(e) { inputElement.click(); };

      function insertTextAtCursor(text) {
        var sel, range, html;
        if (window.getSelection) {
          sel = window.getSelection();
          if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode( document.createTextNode(text) );
          }
        }
        else if (document.selection && document.selection.createRange) {
          document.selection.createRange().text = text;
        }
      }

      // Define event handlers
      function uploadProgress(e) {
        $scope.$apply(function () {
          if (e.lengthComputable) {
            var progress = Math.round(e.loaded * 100 / e.total);
            console.log(progress);
          }
          else { console.log('unable to compute'); }
        });
      }
      function uploadComplete(e) {
        var xhr = e.srcElement || e.target;
        $scope.$apply(function () {
          if (xhr.status === 204) { // successful upload
            var editor = $element[0].getElementsByClassName('editor-input')[0];
            $(editor).focus();
            insertTextAtCursor('[img]' + $scope.imageUrl + '[/img]');
            $(editor).blur();
          }
          else {
            console.log('upload failed at the end');
          }
        });
      }
      function uploadFailed(e) {
        $scope.$apply(function () {
          console.log('upload failed');
        });
      }
      function uploadCanceled(e) {
        $scope.$apply(function () {
          console.log('upload cancelled');
        });
      }
      function upload(e) {
        // files to upload
        $scope.files = $element.find('input')[0].files;
        var file = $scope.files[0];

        $http.get('/policy/' + file.name)
        .success(function(data) {
          // get policy and signature
          var policy = data.policy;
          var signature = data.signature;
          var accessKey = data.accessKey;
          var url = data.uploadUrl;
          var filename = data.filename;
          $scope.imageUrl = data.imageUrl;

          // form data
          var fd = new FormData();
          fd.append('key', 'images/' + filename);
          fd.append('acl', 'public-read');
          fd.append('Content-Type', file.type);
          fd.append('AWSAccessKeyId', accessKey);
          fd.append('policy', policy);
          fd.append('signature', signature);
          fd.append("file", file);

          var xhr = new XMLHttpRequest();
          xhr.upload.addEventListener("progress", uploadProgress, false);
          xhr.addEventListener("load", uploadComplete, false);
          xhr.addEventListener("error", uploadFailed, false);
          xhr.addEventListener("abort", uploadCanceled, false);
          $scope.$emit('s3upload:start', xhr);

          // Send the file
          xhr.open('POST', url, true);
          xhr.send(fd);
        })
        .error(function(data) { console.log(data); });
      }

      // bind to changes in the image input 
      inputElement.bind('change', upload);
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
