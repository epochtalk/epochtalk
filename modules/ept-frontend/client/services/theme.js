'use strict';
/* jslint node: true */

module.exports = ['Themes', 'Alert', function(Themes, Alert) {

  // True if in preview mode, false if not
  var previewActive = false;

  // Theme Model
  var theme = null;

  // Lookup for the stylesheets tag
  var defaultHref = 'link[href^="/static/css/app.css"]';
  var previewHref = 'link[href^="/static/css/preview.css"]';

  var toggleCSS = function(preview) {
    previewActive = preview;
    var linkTag = document.querySelector(defaultHref) || document.querySelector(previewHref);
    var alertService = document.querySelector('.alertService');
    if (preview) { // push alert service div down
      linkTag.href = '/static/css/preview.css';
      alertService.style['margin-top'] = '2rem';
    }
    else { // reset alert service div
      linkTag.href = '/static/css/app.css';
      alertService.style['margin-top'] = '0';
    }
  };

  // Theme Preview API
  var themeAPI = {
    setTheme: function(model) { theme = model; },
    saveTheme: function() {
      Themes.setTheme(theme).$promise
      .then(function() {
        toggleCSS(false);
        Alert.success('Theme successfully updated');
        theme = null;
      })
      .catch(function() { Alert.error('There was an error setting the theme'); });
    },
    previewActive: function() { return previewActive; },
    toggleCSS: function(preview) {
      toggleCSS(preview);
    }
  };

  return themeAPI;
}];
