module.exports = ['$scope', '$timeout', '$location', '$anchorScroll', 'Auth', 'Posts', 'thread', 'posts', 'page', 'limit',
  function($scope, $timeout, $location, $anchorScroll, Auth, Posts, thread, posts, page, limit) {
    var ctrl = this;
    this.loggedIn = Auth.isAuthenticated;
    var parent = $scope.$parent.PostsWrapperCtrl;
    parent.page = page;
    
    this.resetEditor = true;
    this.showEditor = false;
    this.tempPost = {
      thread_id: '',
      title: '',
      body: '',
      encodedBody: ''
    };
    this.posting = {
      type: '',
      id: '',
      index: '',
      error: '',
      post: this.tempPost,
    };

    // set the thread, new post, and calculate the total number of pages
    thread.$promise.then(function(thread) {
      ctrl.thread = thread;
      ctrl.writePost();
      ctrl.totalPosts = thread.post_count;
      calculatePages();
    });

    // define all the posts
    posts.$promise.then(function(posts) {
      ctrl.posts = posts;
      $timeout($anchorScroll);
    });

    // figure out how many pages there should be in this thread
    // Should be called only after the total number of posts this thread
    // has is already determined or recalculated.
    var calculatePages = function() {
      var count;
      if (ctrl.limit === 'all') { count = Number(ctrl.totalPosts); }
      else { count = Number(ctrl.limit) || 10; }
      parent.pageCount = Math.ceil(ctrl.totalPosts / count);
    };

    this.writePost = function(index) {
      var post = ctrl.posts && ctrl.posts[index] || '';
      if (post) {
        ctrl.posting.type = 'edit';
        ctrl.posting.index = index;
      }
      else {
        ctrl.posting.type = 'new';
        ctrl.posting.index = '';
      }
      
      ctrl.posting.error = '';
      ctrl.posting.id = post.id || '';
      var editorPost = ctrl.posting.post;
      editorPost.thread_id = post.thread_id || ctrl.thread.id;
      editorPost.title = post.title || 'Re: ' + ctrl.thread.title;
      editorPost.body = post.body || '';
      editorPost.encodedBody = post.encodedBody || '';
      
      if (post) { ctrl.showEditor = true; }
      ctrl.resetEditor = true;
    };

    this.savePost = function() {
      var type = ctrl.posting.type;
      var post = ctrl.posting.post;
      var postPromise;

      if (type === 'new') {
        postPromise = Posts.save(post).$promise;
      }
      else if (type === 'edit') {
        postPromise = Posts.update({id: ctrl.posting.id}, post).$promise;
      }

      postPromise.then(function(data) {
        if (type === 'new') {
          // Increment post count and recalculate ctrl.pageCount
          ctrl.totalPosts++;
          calculatePages();
          // Go to last page in the thread and scroll to new post
          $location.search('page', parent.pageCount);
          $location.hash(data.id); // set post id in url hash for scrolling
        }
        else if (type === 'edit') {
          var index = ctrl.posting.index;
          ctrl.posts[index].body = data.body;
          ctrl.posts[index].encodedBody = data.encodedBody;
        }
        
        ctrl.writePost(); // reset editor
      })
      .catch(function(response) {
        var error = '';
        if (response.status == 500) {
          error = 'Post could not be saved. ';
          error += 'Please refresh the page.';
        }
        else { error = response.data.message; }

        ctrl.posting.error = {};
        ctrl.posting.error.message = error;
      });
    };
  }
];
