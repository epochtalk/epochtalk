module.exports = ['$scope', '$timeout', '$location', '$route', '$anchorScroll', 'Auth', 'Posts', 'thread', 'posts', 'page', 'limit',
  function($scope, $timeout, $location, $route, $anchorScroll, Auth, Posts, thread, posts, page, limit) {
    var ctrl = this;
    this.loggedIn = Auth.isAuthenticated;
    var tempPosts = {};
    this.page = page;
    this.limit = limit;

    thread.$promise.then(function(thread) {
      ctrl.thread = thread;
      ctrl.newPost = { title: 'Re: ' + thread.title, thread_id: thread.id };
      ctrl.totalPosts = thread.post_count;
      calculatePages();
    });

    posts.$promise.then(function(posts) {
      ctrl.posts = posts;
    });

    $timeout(function() { $anchorScroll(); });

    var calculatePages = function() {
      var count;
      if (ctrl.limit === 'all') { count = Number(ctrl.totalPosts); }
      else { count = Number(ctrl.limit) || 10; }
      ctrl.pageCount = Math.ceil(ctrl.totalPosts / count);
    };

    var gotoAnchor = function(id, jumpToLastPage) {
      $timeout(function() {
        if (jumpToLastPage) { $location.search('page', ctrl.pageCount); }
        $location.hash(id);
        $anchorScroll();
      }, 100);
    };

    // new post methods

    this.saveText = function(encoded, text) {
      ctrl.newPost.encodedBody = encoded;
      ctrl.newPost.body = text;
    };

    this.savePost = function() {
      delete ctrl.newPost.error;

      // error check input
      if (!this.newPost.title || this.newPost.title.length === 0) {
        this.newPost.error = {};
        this.newPost.error.message = 'No Title Found';
        return;
      }
      if (!this.newPost.body || this.newPost.body.length === 0) {
        this.newPost.error = {};
        this.newPost.error.message = 'No Post Body Found';
        return;
      }

      // use input text when saving post
      this.newPost.body = this.newPost.encodedBody;
      Posts.save(this.newPost).$promise
      .then(function(data) {
        ctrl.totalPosts++; // Increment post count and recalculate pageCount
        calculatePages();
        gotoAnchor(data.id, true);
      })
      .catch(function(response) {
        var error = '';
        if (response.status === 500) {
          error = 'Post could not be saved. ';
          error += 'Please refresh the page.';
        }
        else { error = response.data.message; }

        ctrl.newPost.error = {};
        ctrl.newPost.error.message = error;
      });
    };

    // edit post methods

    this.startEditPost = function(index) {
      var editPost = this.posts[index];

      // save a copy in case they cancel
      tempPosts[editPost.id] = {};
      tempPosts[editPost.id].title = editPost.title;
      tempPosts[editPost.id].body = editPost.body;
      tempPosts[editPost.id].encodedBody = editPost.encodedBody;

      // check encodedBody exists, if not, use body for editing
      if (!editPost.encodedBody) {
        editPost.encodedBody = editPost.body;
      }

      // turn on editing
      this.posts[index].editMode = true;
    };

    this.saveEditText = function(post, encoded, text) {
      post.encodedBody = encoded;
      post.body = text;
    };

    this.saveEditPost = function(index) {
      var editPost = this.posts[index];

      // check input
      delete editPost.error;
      if (!editPost.title || editPost.title.length === 0) {
        this.posts[index].error = {};
        this.posts[index].error.message = 'No Title Found';
        return;
      }
      if (!editPost.body || editPost.body.length === 0) {
        this.posts[index].error = {};
        this.posts[index].error.message = 'No Post Body Found';
        return;
      }

      var saveEditPost = {
        title: editPost.title,
        body: editPost.encodedBody, // use input text to save
        thread_id: editPost.thread_id
      };

      Posts.update({id: editPost.id}, saveEditPost).$promise
      .then(function(data) {
        $location.hash(data.id);
        $route.reload();
      })
      .catch(function(response) {
        var error = '';
        if (response.status === 500) {
          error = 'Post was not able to be saved. ';
          error += 'Please refresh the page.';
        }
        else { error = response.data.message; }

        ctrl.posts[index].error = {};
        ctrl.posts[index].error.message = error;
      });
    };

    this.cancelEditPost = function(index) {
      var cancelPost = this.posts[index];
      this.posts[index].title = tempPosts[cancelPost.id].title;
      this.posts[index].body = tempPosts[cancelPost.id].body;
      this.posts[index].encodedBody = tempPosts[cancelPost.id].encodedBody;
      this.posts[index].editMode = false;
    };

    // pagination 

    $scope.$on('$routeUpdate', function(event, route) {
      console.log("routeUpdate");
      console.log(route.params.page);

      var query = {
        thread_id: $route.current.params.threadId,
        limit: route.params.limit,
        page: route.params.page
      };
      return Posts.byThread(query).$promise.then(function(posts) {
        ctrl.posts = posts;
        ctrl.page = Number(route.params.page);
      });
    });
  }
];
