var medium = require('medium-editor');
var bbcodeParser = require('epochtalk-bbcode-parser');
var fs = require('fs');

module.exports = [
  '$timeout', '$document', '$window', '$rootScope', 'S3ImageUpload',
  function($timeout, $document, $window, $rootScope, s3ImageUpload) {
  return {
    restrict: 'E',
    scope: {
      body: '=',
      rawBody: '=',
      quote: '=',
      resetSwitch: '=',
      focusSwitch: '=',
      exitSwitch: '=',
      dirty: '='
    },
    controller: function($scope, $element) {
      $scope.imageModal = false;
      $scope.openImageModal = function() {
        $scope.imageModal = true;
      };

      // quote insert 
      $scope.$watch('quote', function(newQuote) {
        if (newQuote) { $scope.insertQuote(newQuote); }
      });

      // reset switch
      $scope.$watch('resetSwitch', function(newValue) {
        if (newValue === true) { $scope.resetEditor(); }
      });

      // autofocus switch
      $scope.$watch('focusSwitch', function(newValue) {
        if (newValue === true) { $scope.focusEditor(); }
      });

      // exit switch
      $scope.$watch('exitSwitch', function(newValue) {
        $scope.exitEditor(newValue);
      });
    },
    link: function($scope, $element) {
      // editor input elements
      var editor = $element[0].getElementsByClassName('editor-input')[0];
      var $editor = angular.element(editor);
      // editor preview elements
      var preview = $element[0].getElementsByClassName('editor-preview')[0];
      var $preview = angular.element(preview);
      // editor footer 
      var footer = $element[0].getElementsByClassName('editor-footer')[0];
      var $footer = angular.element(footer);

      // -- Images 

      // file input (raw html)
      $scope.images = [];
      var inputElement = $element.find('input')[0];
      $scope.openImagePicker = function() { inputElement.click(); };

      $scope.insertImageUrl = function(url) {
        editor.focus();
        var sel = $window.getSelection();
        var range = sel.getRangeAt(0);
        range.collapse(false);
        var text = '[img]' + url + '[/img]';
        range.insertNode( $document[0].createTextNode(text) );
        editor.blur();
      };

      function upload(images) {
        // upload each image
        images.forEach(function(image) {
          var imageProgress = {
            status: 'Initializing',
            name: image.name,
            progress: 0
          };
          $scope.images.push(imageProgress);

          // get policy for this image
          s3ImageUpload.policy(image.name)
          .then(function(policy) {
            imageProgress.id = policy.data.filename;
            imageProgress.status = 'Starting';

            // upload image to s3
            return s3ImageUpload.upload(policy, image)
            .progress(function(percent) {
              imageProgress.progress = percent;
              imageProgress.status = 'Uploading';
            })
            .error(function(data) {
              imageProgress.progress = '--';
              imageProgress.status = 'Failed';
            })
            .success(function(url) {
              imageProgress.status = 'Complete';
              imageProgress.url = url;
              $scope.insertImageUrl(url);
            });
          })
          .catch(function() {
            imageProgress.progress = '--';
            imageProgress.status = "Failed";
          });
        });
      }

      // bind to changes in the image input
      // because angular can handle ng-change on input[file=type]
      angular.element(inputElement).on('change', function() {
        // get all the images from the file picker
        var fileList = inputElement.files;
        var images = [];
        for (var i = 0; i < fileList.length; i++) {
          images.push(fileList[i]);
        }
        upload(images);
        inputElement.value = ''; // clear filelist for reuse
      });

      // drap and drop implementation
      var cancelEvent = function(e) {
        e.stopPropagation();
        e.preventDefault();
      };
      $footer.on("dragenter", cancelEvent);
      $footer.on("dragover", cancelEvent);
      $footer.on("drop", function(e) {
        cancelEvent(e);
        var dt = e.dataTransfer;
        var fileList = dt.files;
        var images = [];
        for (var i = 0; i < fileList.length; i++) {
          var file = fileList[i];
          if (!file.type.match(/image.*/)) { continue; }
          images.push(file);
        }
        upload(images);
      });

      // -- Editor

      // Medium Editor and options
      var options = {
        "targetBlank":true,
        "buttonLabels":"fontawesome",
        "placeholder": ''
      };
      var mediumEditor = new medium(editor, options);

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
        var rawText = $editor.html();
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
        $preview.html(processed);

        // medium always leaves input dirty even if there's no input
        // this will clean it
        if ($editor.text().length === 0) { rawText = ''; }

        // re-bind to scope
        $scope.body = processed;
        $scope.rawBody = rawText;
        $scope.dirty = $scope.originalText !== $scope.rawBody;
        $scope.$apply();
      }

      // debounce parsing on input (250ms)
      var debounce;
      var onChange = function() {
        $timeout.cancel(debounce);
        debounce = $timeout(function() { parseInput(); }, 250);
      };
      $editor.on('blur', onChange);
      $editor.on('input', onChange);

      // scoll binding
      $editor.on('scroll', function() { preview.scrollTop = editor.scrollTop; });
      $preview.on('scroll', function() { editor.scrollTop = preview.scrollTop; });

      // -- Page Exit Eventing

      var confirmMessage = 'It looks like a post is being written.';
      var exitFunction = function() {
        if ($scope.dirty) {
          return confirmMessage;
        }
      };
      $window.onbeforeunload = exitFunction;

      var routeLeaveFunction = function() {
        return $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
          if (toState.url === fromState.url) { return; }
          if ($scope.dirty) {
            var message = confirmMessage + ' Are you sure you want to leave?';
            var answer = confirm(message);
            if (!answer) { e.preventDefault(); }
          }
        });
      };
      var destroyRouteBlocker = routeLeaveFunction();

      // -- Controller Functions

      // directive initialization and reset
      var initEditor = function() {
        // on load ng-model body to editor and preview
        if ($scope.rawBody && $scope.rawBody.length > 0) {
          $editor.html($scope.rawBody);
          $scope.originalText = $scope.rawBody;
        }
        else {
          $editor.html($scope.body);
          $scope.originalText = $scope.body;
          $scope.rawBody = $scope.body;
        }
        onChange();
      };

      $scope.insertQuote = function(newQuote) {
        editor.focus();
        var sel = $window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
          var range = sel.getRangeAt(0);

          var el = $document[0].createElement('div');
          el.innerHTML = newQuote;
          var frag = $document[0].createDocumentFragment(), node, lastNode;
          while ( (node = el.firstChild) ) {
            lastNode = frag.appendChild(node);
          }
          range.insertNode(frag);
          if (lastNode) {
            range = range.cloneRange();
            range.setStartAfter(lastNode);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }

          $scope.quote = '';
          editor.blur();
        }
      };

      // resets the editor 
      $scope.resetEditor = function() {
        initEditor();
        $scope.images = [];
        $scope.resetSwitch = false;
      };

      // focus input on editor element
      $scope.focusEditor = function() {
        $timeout(function() {
          var range = $document[0].createRange();
          range.selectNodeContents(editor);
          range.collapse(false);
          var sel = $window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
          editor.focus();
        }, 10);
        $scope.focusSwitch = false;
      };

      // turns off page exit events
      $scope.exitEditor = function(value) {
        if (value === true) {
          $window.onbeforeunload = undefined;
          if (destroyRouteBlocker) { destroyRouteBlocker(); }
        }
        else if (value === false) {
          $window.onbeforeunload = exitFunction;
          if (destroyRouteBlocker) { destroyRouteBlocker(); }
          destroyRouteBlocker = routeLeaveFunction();
        }
      };

      // -- Destroy

      $element.on('$destroy', function() {
        $window.onbeforeunload = undefined;
        if (destroyRouteBlocker) { destroyRouteBlocker(); }
      });
    },
    template: fs.readFileSync(__dirname + '/editor.html')
  };
}];
