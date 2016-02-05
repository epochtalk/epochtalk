var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var del = require('del');
var mkdirp = require('mkdirp');

var files = [
  { path: '/board', name: 'board.html' },
  { path: '/board', name: 'board.data.html' },
  { path: '/threads/new', name: 'new.html' },
  { path: '/threads/posted', name: 'posted.html' },
  { path: '/threads/posted', name: 'posted.data.html' },
  { path: '/layout', name: '404.html' },
  { path: '/layout', name: 'admin-content.html' },
  { path: '/layout', name: 'footer.html' },
  { path: '/layout', name: 'header.html' },
  { path: '/layout', name: 'header.admin.html' },
  { path: '/layout', name: 'login.html' },
  { path: '/layout', name: 'modals.html' },
  { path: '/layout', name: 'public-content.html' },
  { path: '/messages', name: 'messages.html' },
  { path: '/posts', name: 'posts.html' },
  { path: '/posts', name: 'posts.data.html' },
  { path: '/users/confirm', name: 'confirm.html' },
  { path: '/users/profile', name: 'posts.html' },
  { path: '/users/profile', name: 'profile.html' },
  { path: '/users/reset', name: 'reset.html' },
  { path: '/watchlist', name: 'watchlist.html' },
  { path: '/watchlist', name: 'watchlist.edit.html' },
  { path: '/admin/analytics', name: 'index.html' },
  { path: '/admin/management', name: 'index.html' },
  { path: '/admin/management', name: 'boards.html' },
  { path: '/admin/management', name: 'roles.html' },
  { path: '/admin/management', name: 'users.html' },
  { path: '/admin/moderation', name: 'index.html' },
  { path: '/admin/moderation', name: 'messages.html' },
  { path: '/admin/moderation', name: 'posts.html' },
  { path: '/admin/moderation', name: 'users.html' },
  { path: '/admin/settings', name: 'index.html' },
  { path: '/admin/settings', name: 'advanced.html' },
  { path: '/admin/settings', name: 'theme.html' },
  { path: '/admin/settings', name: 'general.html' },
];

module.exports = function() {
    // remove template dir
  return del(path.join(__dirname, '/../../public/templates'))
  .then(function() {
    return Promise.map(files, function(file) {
      var dirPath = path.join(__dirname, '/../../public/templates', file.path);

      return new Promise(function(resolve, reject) {
        mkdirp(dirPath, function(err) {
          if (err) { return reject(err); }
          else return resolve();
        });
      })
      // symlink files
      .then(function() {
        var appPath = path.join(__dirname, '/../../app');
        var templatePath = path.join(__dirname, '/../../public/templates');
        var start = appPath + file.path + '/' + file.name;
        var end = templatePath + file.path + '/' + file.name;
        fs.symlinkSync(start, end);
      });
    });
  })
  .catch(function(err) { console.log(err); });
};
