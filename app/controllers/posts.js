module.exports = ['$scope', '$timeout', '$location', '$stateParams', '$anchorScroll', 'Auth', 'Posts', 'thread', 'posts', 'page', 'limit',
  function($scope, $timeout, $location, $stateParams, $anchorScroll, Auth, Posts, thread, posts, page, limit) {
    var ctrl = this;
    this.loggedIn = Auth.isAuthenticated; // used to check auth
    var tempPosts = {}; // contains post content while editing
    this.page = page; // current page
    this.limit = limit; // posts per page
    this.resetEditor = true; // used to reset new post editor

    // set the thread, newPost.thread_id and title
    // and calculate the total number of pages
    thread.$promise.then(function(thread) {
      ctrl.thread = thread;
      ctrl.newPost = { title: 'Re: ' + thread.title, thread_id: thread.id };
      ctrl.totalPosts = thread.post_count;
      calculatePages();
    });

    // define all the posts
    posts.$promise.then(function(posts) {
      ctrl.posts = posts;
      $timeout($anchorScroll);
    });

    // scroll to any hash in the url

    // figure out how many pages there should be in this thread
    // Should be called only after the total number of posts this thread
    // has is already determined or recalculated.
    var calculatePages = function() {
      var count;
      if (ctrl.limit === 'all') { count = Number(ctrl.totalPosts); }
      else { count = Number(ctrl.limit) || 10; }
      ctrl.pageCount = Math.ceil(ctrl.totalPosts / count);
    };

    // new post methods

    this.savePost = function() {
      delete ctrl.newPost.error;

      Posts.save(ctrl.newPost).$promise
      .then(function(post) {
        // Increment post count and recalculate ctrl.pageCount
        ctrl.totalPosts++;
        calculatePages();

        // clean out new post
        ctrl.newPost.body = '';
        ctrl.newPost.encodedBody = '';
        ctrl.resetEditor = true; // reset editor

        // Go to last page in the thread
        // and scroll to new post
        $location.search('page', ctrl.pageCount);
        $location.hash(post.id); // set post id in url hash for scrolling
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
      var editPost = ctrl.posts[index];

      // save a copy in case they cancel
      tempPosts[editPost.id] = {};
      tempPosts[editPost.id].title = editPost.title;
      tempPosts[editPost.id].body = editPost.body;
      tempPosts[editPost.id].encodedBody = editPost.encodedBody;

      // turn on editing
      ctrl.posts[index].editMode = true;
    };

    this.saveEditPost = function(index) {
      var editPost = ctrl.posts[index]; // get post content
      delete editPost.error; // delete any errors for this post

      // create updated version of this post
      var saveEditPost = {
        title: editPost.title,
        encodedBody: editPost.encodedBody,
        thread_id: editPost.thread_id
      };

      // away we go!
      Posts.update({id: editPost.id}, saveEditPost).$promise
      .then(function(data) {
        // remove temp post since post has been saved
        delete tempPosts[editPost.id];

        // switch off edit mode
        editPost.editMode = false;
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
      var cancelPost = ctrl.posts[index];

      // replace post content with content from tempPost
      ctrl.posts[index].title = tempPosts[cancelPost.id].title;
      ctrl.posts[index].body = tempPosts[cancelPost.id].body;
      ctrl.posts[index].encodedBody = tempPosts[cancelPost.id].encodedBody;
      ctrl.posts[index].editMode = false; // turn off editing

      delete tempPosts[cancelPost.id]; // delete this content in tempPosts
    };

    // pagination

    $scope.$on('$stateChangeStart', function(event, $stateParams) {
      var query = {
        thread_id: $stateParams.threadId,
        limit: $stateParams.limit,
        page: $stateParams.page
      };
      return Posts.byThread(query).$promise.then(function(posts) {
        ctrl.posts = posts;
        ctrl.page = Number($stateParams.page);
        $timeout($anchorScroll);
      });
    });
  }
];
