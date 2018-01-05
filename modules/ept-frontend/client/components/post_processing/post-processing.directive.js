module.exports = ['$timeout', '$filter', '$compile', function($timeout, $filter, $compile) {
  return {
    scope: {
      postProcessing: '=',
      styleFix: '='
    },
    restrict: 'A',
    link: function($scope, $element) {
      // Auto Date Regex
      var autoDateRegex = /(ept-date=[0-9]+)/ig;
      var autoDate = function(timeString) {
        timeString = timeString.replace('ept-date=', '');
        var dateNumber = Number(timeString) || 0;
        var date = new Date(dateNumber);

        var now = new Date();
        var isToday = now.toDateString() === date.toDateString();
        var isThisYear = now.getYear() === date.getYear();
        if (isToday) {
          date = 'Today at ' +  $filter('date')(date, 'h:mm:ss a');
        }
        else if (isThisYear) {
          date = $filter('date')(date, 'MMMM d, h:mm:ss a');
        }
        else {
          date = $filter('date')(date, 'MMM d, y, h:mm:ss a');
        }
        return date;
      };

      // Auto Link Regex
      var autoLinkRegex = /(?!<code[^>]*?>)((?:https?\:\/\/)+(?![^\s]*?")([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?)(?![^<]*?<\/code>)/ig;
      var autoLink = function(url) {
        var wrap = document.createElement('div');
        var anch = document.createElement('a');

        anch.innerHTML = url;
        anch.href = url;
        anch.target = '_blank';
        wrap.appendChild(anch);
        return wrap.innerHTML;
      };

      var validUrl = function(s) {
        try {
          new URL(s);
          return true;
        }
        catch(e) { return false; }
      };

      // Auto video embed Regex
      var autoVideoRegex = /(?!<code[^>]*?>)((?:.+?)?(?:\/v\/|watch\/|\?v=|\&v=|youtu\.be\/|\/v=|^youtu\.be\/|\/youtu.be\/)([a-zA-Z0-9_-]{11})+(?:[a-zA-Z0-9;:@#?&%=+\/\$_.-]*)*(?:(t=(?:(\d+h)?(\d+m)?(\d+s)?)))*)(?![^<]*?<\/code>)/gi;
      var autoVideo = function(url) {
        if (validUrl(url)) {
          var temp = new URL(url);

          // create query params dict
          var queryParams = {};
          var query = temp.search.substring(1);
          var vars = query.split('&');
          for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            queryParams[pair[0]] = pair[1];
          }

          // parse url for youtube key
          var key = '';
          if (url.indexOf('youtube') > 0) { key = queryParams.v; }
          else { key = temp.pathname.replace('/', ''); }

          // time search param
          var time = queryParams.t;
          if (time && time.indexOf('s') === time.length - 1) {
            time = time.slice(0, -1);
          }
          var src = 'https://www.youtube.com/embed/' + key;
          if (time) { src += '?start=' + time; }

          // create youtube iframe
          var wrap = document.createElement('div');
          var vidWrap = document.createElement('div');
          vidWrap.className = 'video-wrap';
          var frame = document.createElement('iframe');
          frame.width = 640;
          frame.height = 360;
          frame.src = src;
          frame.setAttribute('frameborder', 0);
          frame.setAttribute('allowfullscreen', '');
          vidWrap.appendChild(frame);
          wrap.appendChild(vidWrap);

          // return content
          if (key) { return wrap.innerHTML; }
          else {return url; }
        }
        else { return url; }
      };

      // Style Fix Regex
      var styleFixRegex = /(class="bbcode-\S*")/ig;
      var styleFix = function(styleString) {
        // remove bbcode-prefix
        var classString = styleString.replace('class="bbcode-', '');
        classString = classString.replace('"', '');

        if (classString.indexOf('color-_') === 0) {
            var colorCode = classString.replace('color-_', '');
            return 'ng-style="{ \'color\': \'#' + colorCode + '\' }"';
        }
        else if (classString.indexOf('color') === 0) {
          var color = classString.replace('color-', '');
          return 'ng-style="{ \'color\': \'' + color + '\' }"';
        }
        else if (classString.indexOf('bgcolor-_') === 0) {
          var bgColorCode = classString.replace('bgcolor-_', '');
          return 'ng-style="{ \'background-color\': \'#' + bgColorCode + '\' }"';
        }
        else if (classString.indexOf('bgcolor') === 0) {
          var bgColor = classString.replace('bgcolor-', '');
          return 'ng-style="{ \'background-color\': \'' + bgColor + '\' }"';
        }
        else if (classString.indexOf('text') === 0) {
          var dir = classString.replace('text-', '');
          return 'ng-style="{ \'text-align\': \'' + dir + '\' }"';
        }
        else if (classString.indexOf('list') === 0) {
          var type = classString.replace('list-', '');
          return 'ng-style="{ \'list-style-type\': \'' + type + '\' }"';
        }
        else if (classString.indexOf('shadow-_') === 0) {
          var shadowCode = classString.replace('shadow-_', '');
          shadowCode = shadowCode.replace(/_/gi, ' ');
          shadowCode = '#' + shadowCode;
          return 'ng-style="{ \'text-shadow\': \'' + shadowCode + '\' }"';
        }
        else if (classString.indexOf('shadow') === 0) {
          var shadow = classString.replace('shadow-', '');
          shadow = shadow.replace(/_/gi, ' ');
          return 'ng-style="{ \'text-shadow\': \'' + shadow + '\' }"';
        }
        else if (classString.indexOf('size') === 0) {
          var size = classString.replace('size-', '');
          return 'ng-style="{ \'font-size\': \'' + size + '\' }"';
        }
        else {
          return styleString;
        }
      };

      var process = function() {
        var postBody = $scope.postProcessing;
        var processed = postBody || '';
        var doStyleFix = $scope.styleFix;
        // autoDate and autoLink
        processed = processed.replace(new RegExp('&#47;&#47;', 'g'), '//');
        processed = processed.replace(autoDateRegex, autoDate) || processed;
        processed = processed.replace(autoVideoRegex, autoVideo) || processed;
        processed = processed.replace(autoLinkRegex, autoLink) || processed;

        // styleFix
        if (doStyleFix) {
          processed = processed.replace(styleFixRegex, styleFix) || processed;
        }

        // dump html into element
        $element.html(processed);

        // image loading
        var images = $($element[0]).find('img');
        images.each(function(index, image) {
          $(image).addClass('image-loader');
        });

        // noopener/noreferrer hack
        $('a[target="_blank"]').attr('rel', 'noopener noreferrer');

        // compile directives
        $compile($element.contents())($scope);
      };

      $scope.$watch('postProcessing',
        function() { $timeout(function () { process(); }); }
      );
    }
  };
}];
