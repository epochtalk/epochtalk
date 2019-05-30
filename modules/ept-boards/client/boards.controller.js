module.exports = ['$timeout', '$anchorScroll', 'Session', 'User', 'PreferencesSvc', 'pageData',
  function($timeout, $anchorScroll, Session, User, PreferencesSvc, pageData) {
    var collapsedCats = PreferencesSvc.preferences.collapsed_categories || [];
    this.loggedIn = Session.isAuthenticated;
    this.categorizedBoards = pageData.boards;
    this.recentThreads = pageData.threads;

    this.categorizedBoards.map(function(category) {
      // set category visibility
      if (collapsedCats.indexOf(category.id) > -1) {
        category.show = false;
        category.initial = 'closed';
      }
      else {
        category.show = true;
        category.initial = 'open';
      }

      // set total_thread_count and total_post_count for all boards
      var boards = category.boards;
      boards.map(function(board) {
        var children = countTotals(board.children);
        board.total_thread_count = children.thread_count + board.thread_count;
        board.total_post_count = children.post_count + board.post_count;
      });
    });

    // Category toggling
    this.toggleCategory = function(cat) {
      cat.show = !cat.show;

      if (!Session.isAuthenticated()) { return; }

      // if showing, remove from collapsed_categories in place
      if (cat.show) { remove(collapsedCats, cat.id); }
      // else add to collapsed_categories
      else if (collapsedCats.indexOf(cat.id) < 0) { collapsedCats.push(cat.id); }

      // save changes to local preferences
      var newPrefs = PreferencesSvc.preferences;
      newPrefs.collapsed_categories = collapsedCats;
      PreferencesSvc.setPreferences(newPrefs);

      // save changes to server preferences
      newPrefs.username = Session.user.username;
      User.update({ id: Session.user.id }, newPrefs);
    };

    function remove(array, item) {
      var found = array.indexOf(item);
      while (found !== -1) {
        array.splice(found, 1);
        found = array.indexOf(item);
      }
    }

    function countTotals(countBoards) {
      var thread_count = 0;
      var post_count = 0;

      if (countBoards.length > 0) {
        countBoards.forEach(function(board) {
          var children = countTotals(board.children);
          thread_count += children.thread_count + board.thread_count;
          post_count += children.post_count + board.post_count;
          board.total_thread_count = thread_count;
          board.total_post_count = post_count;
        });
      }

      return {thread_count: thread_count, post_count: post_count};
    }

    this.generateCatId = function(name, viewOrder) {
      var anchorId = (name + '-' + viewOrder).replace(/\s+/g, '-').toLowerCase();
      return anchorId;
    };

    $timeout($anchorScroll);
  }
];
