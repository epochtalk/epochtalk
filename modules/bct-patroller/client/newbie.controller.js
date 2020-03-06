var ctrl = ['Alert', 'pageData', function(Alert, pageData) {
    var ctrl = this;
    this.posts = pageData;

    function checkUsersOnline() {
      var uniqueUsers = {};
      ctrl.posts.forEach(function(post) {
        uniqueUsers[post.user.id] = 'user';
      });

      Object.keys(uniqueUsers).map(function(user) {
        return Websocket.isOnline(user, setOnline);
      });
    }

    function setOnline(err, data) {
      if (err) { return console.log(err); }
      else {
        ctrl.posts.map(function(post) {
          if (post.user.id === data.id) {
            post.user.online = data.online;
          }
        });
      }
    }
  }
];

module.exports = angular.module('bct.patroller.newbieCtrl', [])
.controller('NewbieCtrl', ctrl)
.name;
