var directive = ['User', '$timeout', '$window', '$rootScope', '$filter', function(User, $timeout, $window, $rootScope, $filter) {
  return {
    restrict: 'E',
    scope: {
      bodyHtml: '=',
      body: '=',
      quote: '=',
      resetSwitch: '=',
      focusSwitch: '=',
      exitSwitch: '=',
      dirty: '=',
      rightToLeft: '=',
      thread: '=',
      postEditorMode: '=',
      editorConvoMode: '=',
      threadEditorMode: '=',
      createAction: '=',
      updateAction: '=',
      canCreate: '=',
      canUpdate: '=',
      showSwitch: '=',
      receivers: '=',
      newMessage: '=',
      posting: '='
    },
    template: require('./editor.html'),
    controller: ['$scope', '$element', function($scope) {
      // quote insert

      $scope.$watch('quote', function(newQuote) {
        if (newQuote) { $scope.insertQuote(newQuote); }
      });

      // reset switch
      $scope.$watch('resetSwitch', function(newValue) {
        if (newValue === true) { $scope.resetEditorFn(); }
      });

      // autofocus switch
      $scope.$watch('focusSwitch', function(newValue) {
        if (newValue === true && !$scope.editorConvoMode) {
          $scope.focusEditorFn();
        }
      });

      // exit switch
      $scope.$watch('exitSwitch', function(newValue) {
        $scope.exitEditor(newValue);
      });

      // show switch
      $scope.$watch('showSwitch', function(newValue) {
        $scope.loadEditor(newValue);
      });
    }],
    link: function($scope, $element) {
      // editor input elements
      var editor = $element[0].getElementsByClassName('editor-input')[0];
      var $editor = angular.element(editor);

      // Grab post_max_length from web configs
      $scope.post_max_length = $rootScope.$webConfigs.post_max_length;

      // -- Images

      $scope.insertImageUrl = function(url) {
        $scope.preview = false; // show compose tab
        if (!url) { return; }
        editor.focus();
        var inserted = $editor.val() + '[img]' + url + '[/img]';
        $editor.val(inserted);
        editor.blur();
      };

      // -- Editor

      function parseInput() {
        // BBCode Parsing
        var rawText = $editor.val();
        var processed = rawText;
        $window.parsers.forEach(function(parser) {
          // second boolean tells the processor to strip html
          processed = parser.parse(processed, false);
        });

        // re-bind to scope
        $scope.bodyHtml = processed;
        $scope.body = rawText;
        $scope.dirty = $scope.originalText !== $scope.body;
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

      // -- Page Exit Eventing

      var confirmMessage = 'It looks like a post is being written.';
      var exitFunction = function() { if ($scope.dirty) { return confirmMessage; } };
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
        // This is hacky, but it stops us from having to make a db query... Maybe replace later
        // This checks if any of the post bodys has the right to left class, letting the editor
        // know that it should display in rtl too.
        $scope.rtl = $scope.rightToLeft || ($(".rtl")[0] !== undefined);

        // on load ng-model body to editor and preview
        $scope.preview = false; // show compose tab
        if ($scope.body && $scope.body.length > 0) {
          $scope.body = $filter('decode')($scope.body);
          $editor.val($scope.body);
          $scope.originalText = $scope.body;
        }
        else {
          $scope.bodyHtml = $filter('decode')($scope.bodyHtml);
          $editor.val($scope.bodyHtml);
          $scope.originalText = $scope.bodyHtml;
          $scope.body = $scope.bodyHtml;
        }
        onChange();
      };

      $scope.insertQuote = function(newQuote) {
        editor.focus();
        var quote = '[quote author=' + newQuote.username;
        quote += ' link=';
        quote += '/threads/' + newQuote.threadId + '/posts?page=' + newQuote.page + '#' + newQuote.postId;
        quote += ' date=' + newQuote.createdAt + ']';
        quote += newQuote.body;
        quote += '[/quote]';
        $editor.val($editor.val() + $filter('decode')(quote));
        $scope.quote = '';
        editor.blur();
      };

      // resets the editor
      $scope.resetImages = false;
      $scope.resetEditorFn = function() {
        initEditor();
        $scope.resetImages = true;
        $scope.resetSwitch = false;
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

      // Editor Wrap
      $scope.resize = true;
      $scope.editorPosition = 'editor-fixed-right';
      $scope.isMinimized = true;
      $scope.showEditor = false;
      if ($scope.editorConvoMode) {
        $scope.receivers = [];
      }

      $scope.fullscreen = function() {
        if ($scope.isMinimized) {
          $scope.isMinimized = false;
          $scope.editorPosition = 'editor-full-screen';
          $scope.resize = false;
        }
        else {
          $scope.isMinimized = true;
          $scope.editorPosition = 'editor-fixed-right';
          $scope.resize = true;
        }
      };

      $scope.loadTags = function(query) {
        return User.lookup({ username: query }).$promise
        .then(function(users) { return users; });
      };

      var discardAlert = function() {
        if ($scope.dirtyEditor) {
          var message = 'It looks like you were working on something. ';
          message += 'Are you sure you want to leave that behind?';
          return confirm(message);
        }
        else { return true; }
      };

      $scope.closeFormatting = function() {
        $scope.showFormatting = false;
      };

      function closeEditor() {
        if ($scope.editorConvoMode) {
          $scope.newMessage.content = { subject: '', body: '', body_html: '' };
        }
        $scope.posting = { post: { body_html: '', body: '' } };
        $scope.resetEditor = true;
        $scope.showEditor = false;
        $scope.showFormatting = false;
        $scope.showSwitch = false;
      }

      $scope.loadEditor = function(focus) {
        if (discardAlert()) {
          var editorMsg = $scope.newMessage;
          if ($scope.editorConvoMode) {
            $scope.receivers = [];
            editorMsg.subject = '';
            editorMsg.content.body_html = '';
            editorMsg.content.body = '';

            if ($scope.editorConvoMode) {
              $scope.newMessage = {
                content: { body: '', body_html: '' },
                receiver_ids: [],
                receiver_usernames: []
              };
            }
          }

          $scope.resetEditor = true;
          $scope.showEditor = true;
          if (focus === false) { $scope.focusSwitch = false; }
          else { $scope.focusSwitch = true; }
        }
      };

      $scope.cancel = function() {
        if (discardAlert()) { closeEditor(); }
      };


      // focus input on editor element
      $scope.focusEditorFn = function() {
        $timeout(function() { editor.focus(); }, 10);
        $scope.focusSwitch = false;
      };

    }
  };
}];

module.exports = angular.module('ept.directives.epochtalk-editor', [])
.directive('epochtalkEditor', directive);
