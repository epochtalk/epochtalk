var path = require('path');

module.exports = [
  {
    name: 'auth.reports.messages.reports.create',
    method: require(path.normalize(__dirname + '/messages/reports/create'))
  },
  {
    name: 'auth.reports.messages.reports.page',
    method: require(path.normalize(__dirname + '/messages/reports/page'))
  },
  {
    name: 'auth.reports.messages.reports.update',
    method: require(path.normalize(__dirname + '/messages/reports/update'))
  },
  {
    name: 'auth.reports.messages.notes.create',
    method: require(path.normalize(__dirname + '/messages/notes/create'))
  },
  {
    name: 'auth.reports.messages.notes.page',
    method: require(path.normalize(__dirname + '/messages/notes/page'))
  },
  {
    name: 'auth.reports.messages.notes.update',
    method: require(path.normalize(__dirname + '/messages/notes/update'))
  },
  {
    name: 'auth.reports.posts.reports.create',
    method: require(path.normalize(__dirname + '/posts/reports/create'))
  },
  {
    name: 'auth.reports.posts.reports.page',
    method: require(path.normalize(__dirname + '/posts/reports/page'))
  },
  {
    name: 'auth.reports.posts.reports.update',
    method: require(path.normalize(__dirname + '/posts/reports/update'))
  },
  {
    name: 'auth.reports.posts.notes.create',
    method: require(path.normalize(__dirname + '/posts/notes/create'))
  },
  {
    name: 'auth.reports.posts.notes.page',
    method: require(path.normalize(__dirname + '/posts/notes/page'))
  },
  {
    name: 'auth.reports.posts.notes.update',
    method: require(path.normalize(__dirname + '/posts/notes/update'))
  },
  {
    name: 'auth.reports.users.reports.create',
    method: require(path.normalize(__dirname + '/users/reports/create'))
  },
  {
    name: 'auth.reports.users.reports.page',
    method: require(path.normalize(__dirname + '/users/reports/page'))
  },
  {
    name: 'auth.reports.users.reports.update',
    method: require(path.normalize(__dirname + '/users/reports/update'))
  },
  {
    name: 'auth.reports.users.notes.create',
    method: require(path.normalize(__dirname + '/users/notes/create'))
  },
  {
    name: 'auth.reports.users.notes.page',
    method: require(path.normalize(__dirname + '/users/notes/page'))
  },
  {
    name: 'auth.reports.users.notes.update',
    method: require(path.normalize(__dirname + '/users/notes/update'))
  }
];
