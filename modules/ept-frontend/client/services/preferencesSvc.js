module.exports = ['User', '$window', function(User, $window) {
    var preferences = {};
    var storage = {}; // fallback for safari private browser
    var hasLocalStorage = checkLocalStorage();
    if (hasLocalStorage) { storage = $window.localStorage; }

    function checkLocalStorage() {
      var testKey = 'test';
      var storage = $window.localStorage;
      try {
        storage.setItem(testKey, '1');
        storage.removeItem(testKey);
        return true;
      }
      catch (error) { return false; }
    }

    // Attempt to retrieve preferences from storage
    try {
      preferences = {
        posts_per_page: storage.posts_per_page,
        threads_per_page: storage.threads_per_page,
      };
      if (storage.collapsed_categories) {
        preferences.collapsed_categories = JSON.parse(storage.collapsed_categories);
      }
    }
    catch(err) { console.log('Error parsing preferences from storage: ', err); }

    function loadContainer(newPref, container, isStorage) {
      container.posts_per_page = newPref.posts_per_page;
      container.threads_per_page = newPref.threads_per_page;
      if (isStorage) {
        container.collapsed_categories = JSON.stringify(newPref.collapsed_categories || []);
      }
      else { container.collapsed_categories = newPref.collapsed_categories || []; }
    }

    function clearContainer(container) {
      delete container.posts_per_page;
      delete container.threads_per_page;
      delete container.collapsed_categories;
    }

    // Service API
    var preferencesAPI = {
      preferences: preferences,
      pullPreferences: function() {
        return User.preferences().$promise
        .then(function(extPrefs) {
          loadContainer(extPrefs, storage, true);
          loadContainer(extPrefs, preferences, false);
        });
      },
      setPreferences: function(newPref) {
        loadContainer(newPref, storage, true);
        loadContainer(newPref, preferences, false);
      },
      clearPreferences: function() {
        clearContainer(preferences);
        clearContainer(storage);
      },
      getPreferences: function() { return preferences; }
    };

    return preferencesAPI;
  }
];
