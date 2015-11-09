var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');

var appPath = path.join(__dirname, '/../../app');
var templatePath = path.join(__dirname, '/../../public/templates');

module.exports = function() {
  return new Promise(function(resolve, reject) {
    fs.unlinkSync(templatePath + '/board/board.html');
    fs.unlinkSync(templatePath + '/board/board.data.html');
    fs.unlinkSync(templatePath + '/thread/new-thread.html');
    fs.unlinkSync(templatePath + '/layout/404.html');
    fs.unlinkSync(templatePath + '/layout/admin-content.html');
    fs.unlinkSync(templatePath + '/layout/footer.html');
    fs.unlinkSync(templatePath + '/layout/header.admin.html');
    fs.unlinkSync(templatePath + '/layout/header.html');
    fs.unlinkSync(templatePath + '/layout/login.html');
    fs.unlinkSync(templatePath + '/layout/modals.html');
    fs.unlinkSync(templatePath + '/layout/public-content.html');
    fs.unlinkSync(templatePath + '/messages/messages.html');
    fs.unlinkSync(templatePath + '/posts/posts.html');
    fs.unlinkSync(templatePath + '/posts/posts.data.html');
    fs.unlinkSync(templatePath + '/user/confirm.html');
    fs.unlinkSync(templatePath + '/user/posts.html');
    fs.unlinkSync(templatePath + '/user/profile.html');
    fs.unlinkSync(templatePath + '/user/reset.html');
    fs.unlinkSync(templatePath + '/watchlist/watchlist.html');
    fs.unlinkSync(templatePath + '/watchlist/watchlist.edit.html');
    fs.unlinkSync(templatePath + '/admin/analytics/index.html');
    fs.unlinkSync(templatePath + '/admin/management/index.html');
    fs.unlinkSync(templatePath + '/admin/management/boards.html');
    fs.unlinkSync(templatePath + '/admin/management/roles.html');
    fs.unlinkSync(templatePath + '/admin/management/users.html');
    fs.unlinkSync(templatePath + '/admin/moderation/index.html');
    fs.unlinkSync(templatePath + '/admin/moderation/messages.html');
    fs.unlinkSync(templatePath + '/admin/moderation/posts.html');
    fs.unlinkSync(templatePath + '/admin/moderation/users.html');
    fs.unlinkSync(templatePath + '/admin/settings/index.html');
    fs.unlinkSync(templatePath + '/admin/settings/forum.html');
    fs.unlinkSync(templatePath + '/admin/settings/general.html');
    return resolve();
  })
  .catch(function() {})
  .then(function() {
    // symlink html files
    fs.symlinkSync(appPath + '/board/board.html', templatePath + '/board/board.html');
    fs.symlinkSync(appPath + '/board/board.data.html', templatePath + '/board/board.data.html');
    fs.symlinkSync(appPath + '/board/new-thread.html', templatePath + '/thread/new-thread.html');
    fs.symlinkSync(appPath + '/layout/404.html', templatePath + '/layout/404.html');
    fs.symlinkSync(appPath + '/layout/admin-content.html', templatePath + '/layout/admin-content.html');
    fs.symlinkSync(appPath + '/layout/footer.html', templatePath + '/layout/footer.html');
    fs.symlinkSync(appPath + '/layout/header.admin.html', templatePath + '/layout/header.admin.html');
    fs.symlinkSync(appPath + '/layout/header.html', templatePath + '/layout/header.html');
    fs.symlinkSync(appPath + '/layout/login.html', templatePath + '/layout/login.html');
    fs.symlinkSync(appPath + '/layout/modals.html', templatePath + '/layout/modals.html');
    fs.symlinkSync(appPath + '/layout/public-content.html', templatePath + '/layout/public-content.html');
    fs.symlinkSync(appPath + '/messages/messages.html', templatePath + '/messages/messages.html');
    fs.symlinkSync(appPath + '/posts/posts.html', templatePath + '/posts/posts.html');
    fs.symlinkSync(appPath + '/posts/posts.data.html', templatePath + '/posts/posts.data.html');
    fs.symlinkSync(appPath + '/user/confirm.html', templatePath + '/user/confirm.html');
    fs.symlinkSync(appPath + '/user/posts.html', templatePath + '/user/posts.html');
    fs.symlinkSync(appPath + '/user/profile.html', templatePath + '/user/profile.html');
    fs.symlinkSync(appPath + '/user/reset.html', templatePath + '/user/reset.html');
    fs.symlinkSync(appPath + '/watchlist/watchlist.html', templatePath + '/watchlist/watchlist.html');
    fs.symlinkSync(appPath + '/watchlist/watchlist.edit.html', templatePath + '/watchlist/watchlist.edit.html');
    fs.symlinkSync(appPath + '/admin/analytics/index.html', templatePath + '/admin/analytics/index.html');
    fs.symlinkSync(appPath + '/admin/management/index.html', templatePath + '/admin/management/index.html');
    fs.symlinkSync(appPath + '/admin/management/boards.html', templatePath + '/admin/management/boards.html');
    fs.symlinkSync(appPath + '/admin/management/roles.html', templatePath + '/admin/management/roles.html');
    fs.symlinkSync(appPath + '/admin/management/users.html', templatePath + '/admin/management/users.html');
    fs.symlinkSync(appPath + '/admin/moderation/index.html', templatePath + '/admin/moderation/index.html');
    fs.symlinkSync(appPath + '/admin/moderation/messages.html', templatePath + '/admin/moderation/messages.html');
    fs.symlinkSync(appPath + '/admin/moderation/posts.html', templatePath + '/admin/moderation/posts.html');
    fs.symlinkSync(appPath + '/admin/moderation/users.html', templatePath + '/admin/moderation/users.html');
    fs.symlinkSync(appPath + '/admin/settings/index.html', templatePath + '/admin/settings/index.html');
    fs.symlinkSync(appPath + '/admin/settings/forum.html', templatePath + '/admin/settings/forum.html');
    fs.symlinkSync(appPath + '/admin/settings/general.html', templatePath + '/admin/settings/general.html');
  });
};
