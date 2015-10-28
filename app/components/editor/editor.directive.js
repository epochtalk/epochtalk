var bbcodeParser = require('epochtalk-bbcode-parser');

module.exports = ['$timeout', '$window', '$rootScope', function($timeout, $window, $rootScope) {
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
    template: require('./editor.html'),
    controller: ['$scope', '$element', function($scope, $element) {
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
    }],
    link: function($scope, $element) {
      // editor input elements
      var editor = $element[0].getElementsByClassName('editor-input')[0];
      var $editor = angular.element(editor);
      // editor preview elements
      var preview = $element[0].getElementsByClassName('editor-preview')[0];
      var $preview = angular.element(preview);

      // -- Images

      $scope.insertImageUrl = function(url) {
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
        rawText = rawText.replace(/(?:<|&lt;)/g, '&#60;'); // prevent html
        rawText = rawText.replace(/(?:>|&gt;)/g, '&#62;');
        var processed = bbcodeParser.process({text: rawText}).html;

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
        if ($scope.dirty) { return confirmMessage; }
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
          $editor.val($scope.rawBody);
          $scope.originalText = $scope.rawBody;
        }
        else {
          $editor.val($scope.body);
          $scope.originalText = $scope.body;
          $scope.rawBody = $scope.body;
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
        $editor.val($editor.val() + quote);
        $scope.quote = '';
        editor.blur();
      };

      // resets the editor
      $scope.resetEditor = function() {
        initEditor();
        $scope.images = [];
        $scope.resetSwitch = false;
      };

      // focus input on editor element
      $scope.focusEditor = function() {
        $timeout(function() { editor.focus(); }, 10);
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
    }
  };
}];
