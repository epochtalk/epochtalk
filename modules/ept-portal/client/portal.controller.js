module.exports = ['$timeout', '$anchorScroll', 'Session', 'pageData',
  function($timeout, $anchorScroll, Session, pageData) {
    this.loggedIn = Session.isAuthenticated;
    this.board = pageData.board;
    this.threads = pageData.threads;
    this.recent = pageData.recent;

    $timeout($anchorScroll);

    this.showEditDate = function(thread) {
      return new Date(thread.last_post_created_at) < new Date(thread.last_post_updated_at);
    };

    this.avatarHighlight = function(color) {
      var style = {};
      if (color) { style.border = '0.225rem solid ' + color; }
      return style;
    };

    this.usernameHighlight = function(color) {
      var style = {};
      if (color) {
        style.background = color;
        style.padding = '0 0.3rem';
        style.color = '#ffffff';
      }
      return style;
    };

  }
];
