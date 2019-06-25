var directive = ['UserNotes', 'Session', 'Alert',
function(UserNotes, Session, Alert) {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { userId: '=', user: '=' },
    template: require('./usernotes.html'),
    controllerAs: 'usernotesvm',
    controller: ['$scope', function($scope) {
      var ctrl = this;
      this.authedUser = Session.user;

      this.accessControl = Session.hasPermission('userNotes');
      this.userNote = null; // comment to be submitted
      this.noteSubmitted = false;
      this.submitBtnLabel = 'Leave Comment';

      this.usernotes = null; // model backing profile comments
      this.next = null; // next page
      this.prev = null; // prev page
      this.page = null; // current page

      // Wait for userId to be populated
      $scope.$watch(function() { return ctrl.userId; }, function(val) {
        if (val && ctrl.accessControl && ctrl.accessControl.page) { ctrl.pageUserNotes(); }
      });

      // Page comments
      this.pageUserNotes = function(page) {
        var params = {
          user_id: ctrl.userId,
          page: page || 1,
          limit: 5
        };
        UserNotes.page(params).$promise
        .then(function(noteInfo) {
          ctrl.usernotes = noteInfo.data;
          ctrl.next = noteInfo.next;
          ctrl.prev = noteInfo.prev;
          ctrl.page = noteInfo.page;
          if (ctrl.usernotes.length) { ctrl.user.hasNotes = true; }
          else { ctrl.user.hasNotes = false; }
        })
        .catch(function() {
          Alert.error('There was an error paging this user\'s comments');
        });
      };

      // Leave comment
      this.submitUserNote = function() {
        ctrl.noteSubmitted = true;
        ctrl.submitBtnLabel = 'Loading...';
        var params = {
          user_id: ctrl.userId,
          author_id: ctrl.authedUser.id,
          note: ctrl.userNote
        };
        UserNotes.create(params).$promise
        .then(function() {
          ctrl.pageUserNotes();
          ctrl.userNote = '';
          Alert.success('Sucessfully submitted comment');
        })
        .catch(function() {
          Alert.error('There was an error submitting your comment');
        })
        .finally(function() {
          ctrl.noteSubmitted = false;
          ctrl.submitBtnLabel = 'Leave Comment';
        });
      };

      // Delete comment
      this.deleteUserNote = function(comment) {
        if (comment.author_id !== ctrl.authedUser.id) {
          Alert.error('You may only delete comments you\'ve made');
          return;
        }
        UserNotes.delete({ id: comment.id }).$promise
        .then(function() {
          ctrl.pageUserNotes();
          Alert.success('Sucessfully deleted comment');
        })
        .catch(function() {
          Alert.error('There was an error deleting your comment');
        })
        .finally(function() {
          comment.showConfirmDelete = false;
        });
      };

      // Edit comment
      this.editUserNote = function(comment) {
        if (comment.author_id !== ctrl.authedUser.id) {
          Alert.error('You may only edit comments you\'ve made');
          return;
        }
        UserNotes.update({ id: comment.id, note: comment.noteEdit }).$promise
        .then(function() {
          ctrl.pageUserNotes(ctrl.page);
          Alert.success('Sucessfully edited comment');
        })
        .catch(function() {
          Alert.error('There was an error editing your comment');
        })
        .finally(function() {
          comment.showConfirmDelete = false;
        });
      };

      this.avatarHighlight = function(color) {
        var style = {};
        if (color) { style.border = '0.125rem solid ' + color; }
        return style;
      };

      this.usernameHighlight = function(color) {
        var style = {};
        if (color) {
          style.background = color;
          style.padding = '0 0.125rem';
          style.color = '#ffffff';
        }
        return style;
      };

    }]
  };
}];

module.exports = angular.module('ept.directives.usernotes', [])
.directive('usernotes', directive);
