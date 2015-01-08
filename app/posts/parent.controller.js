module.exports = [
  '$scope', '$location', 'Auth', 'Posts',
  function($scope, $location, Auth, Posts) {
    var ctrl = this;
    this.loggedIn = Auth.isAuthenticated;
    this.dirtyEditor = false;
    this.resetEditor = false;
    this.showEditor = false;
    this.focusEditor = false;
    this.tempPost = { body: '', raw_body: '' };
    this.posting = { post: this.tempPost };
    // pullPage function injected by child controller

    $scope.$watch(
      function() { return ctrl.thread_post_count; },
      function(postCount) { if (postCount) { calculatePages(); } }
    );

    ctrl.newPostEnabled = false;
    $scope.$watchGroup(
      [function() { return ctrl.thread_id; },
       function() { return ctrl.thread_title; }],
      function(values) {
        var id = values[0];
        var title = values[1];
        if (id && title && ctrl.newPostEnabled === false) {
          initEditor(); //set editor
          ctrl.newPostEnabled = true;
        }
      }
    );

    var calculatePages = function() {
      var count;
      if (ctrl.limit === 'all') { count = Number(ctrl.thread_post_count); }
      else { count = Number(ctrl.limit) || 10; }
      ctrl.pageCount = Math.ceil(ctrl.thread_post_count / count);
    };

    var discardAlert = function() {
      if (ctrl.dirtyEditor) {
        var message = 'It looks like you were working on something. ';
        message += 'Are you sure you want to leave that behind?';
        return confirm(message);
      }
      else { return true;}
    };

    var initEditor = function(index, show) {
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
      editorPost.thread_id = post.thread_id || ctrl.thread_id;
      editorPost.title = post.title || 'Re: ' + ctrl.thread_title;
      editorPost.body = post.body || '';
      editorPost.raw_body = post.raw_body || '';

      ctrl.resetEditor = true;
    };

    this.openEditor = function() {
      ctrl.showEditor = true;
      ctrl.focusEditor = true;
    };

    this.closeEditor = function() {
      ctrl.showEditor = false;
    };

    this.loadEditor = function(index) {
      if (discardAlert()) {
        initEditor(index);
        ctrl.openEditor();
      }
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
          ctrl.thread_post_count++;
          calculatePages();
          // Go to last page in the thread and scroll to new post
          var lastPage = ctrl.pageCount;
          if (ctrl.page === lastPage) { ctrl.pullPage(lastPage, data.id); }
          else { $location.search('page', lastPage).hash(data.id); }
        }
        else if (type === 'edit') {
          var index = ctrl.posting.index;
          var editPost = ctrl.posts[index];
          if (editPost.id === ctrl.posting.id) {
            editPost.body = data.body;
            editPost.raw_body = data.raw_body;
          }
        }

        initEditor();
        ctrl.closeEditor();
      })
      .catch(function(response) {
        ctrl.posting.error = {};
        ctrl.posting.error.message = 'Post could not be saved.';
        console.err(response);
      });
    };

    this.cancelPost = function() {
      if (discardAlert()) {
        initEditor();
        ctrl.closeEditor();
      }
    };
  }
];
