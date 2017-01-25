var path = require('path');

module.exports = [
  {
    name: 'auth.reports.messages.reports.create',
    method: require(path.normalize(__dirname + '/messages/reports/create')),
    options: { callback: false }
  },
  {
    name: 'auth.reports.messages.reports.page',
    method: require(path.normalize(__dirname + '/messages/reports/page')),
    options: { callback: false }
  },
  {
    name: 'auth.reports.messages.reports.update',
    method: require(path.normalize(__dirname + '/messages/reports/update')),
    options: { callback: false }
  },
  {
    name: 'auth.reports.messages.notes.create',
    method: require(path.normalize(__dirname + '/messages/notes/create')),
    options: { callback: false }
  },
  {
    name: 'auth.reports.messages.notes.page',
    method: require(path.normalize(__dirname + '/messages/notes/page')),
    options: { callback: false }
  },
  {
    name: 'auth.reports.messages.notes.update',
    method: require(path.normalize(__dirname + '/messages/notes/update')),
    options: { callback: false }
  },
  {
    name: 'auth.reports.posts.reports.create',
    method: require(path.normalize(__dirname + '/posts/reports/create')),
    options: { callback: false }
  },
  {
    name: 'auth.reports.posts.reports.page',
    method: require(path.normalize(__dirname + '/posts/reports/page')),
    options: { callback: false }
  },
  {
    name: 'auth.reports.posts.reports.update',
    method: require(path.normalize(__dirname + '/posts/reports/update')),
    options: { callback: false }
  },
  {
    name: 'auth.reports.posts.notes.create',
    method: require(path.normalize(__dirname + '/posts/notes/create')),
    options: { callback: false }
  },
  {
    name: 'auth.reports.posts.notes.page',
    method: require(path.normalize(__dirname + '/posts/notes/page')),
    options: { callback: false }
  },
  {
    name: 'auth.reports.posts.notes.update',
    method: require(path.normalize(__dirname + '/posts/notes/update')),
    options: { callback: false }
  },
  {
    name: 'auth.reports.users.reports.create',
    method: require(path.normalize(__dirname + '/users/reports/create')),
    options: { callback: false }
  },
  {
    name: 'auth.reports.users.reports.page',
    method: require(path.normalize(__dirname + '/users/reports/page')),
    options: { callback: false }
  },
  {
    name: 'auth.reports.users.reports.update',
    method: require(path.normalize(__dirname + '/users/reports/update')),
    options: { callback: false }
  },
  {
    name: 'auth.reports.users.notes.create',
    method: require(path.normalize(__dirname + '/users/notes/create')),
    options: { callback: false }
  },
  {
    name: 'auth.reports.users.notes.page',
    method: require(path.normalize(__dirname + '/users/notes/page')),
    options: { callback: false }
  },
  {
    name: 'auth.reports.users.notes.update',
    method: require(path.normalize(__dirname + '/users/notes/update')),
    options: { callback: false }
  }
];
