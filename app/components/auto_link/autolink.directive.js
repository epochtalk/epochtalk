module.exports = ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element) {
      var regex = /(?:https?\:\/\/|www\.)+(?![^\s]*?")([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/ig;
      var regexFunction = function(url) {
        var wrap = document.createElement('div');
        var anch = document.createElement('a');
        anch.href = url;
        anch.target = "_blank";
        anch.innerHTML = url;
        wrap.appendChild(anch);
        return wrap.innerHTML;
      };

      var autoLink = function(text) {
        if (!text) { text = ''; }
        var _text = text.replace(regex, regexFunction);
        if (!_text) { _text = ''; }
        return _text;
      };

      $timeout(function () { element.html(autoLink(element.html())); });
    }
  };
}];