var Joi = require('@hapi/joi');
var path = require('path');

module.exports = [
  page: require(path.join(__dirname, 'page')),
  remove: require(path.join(__dirname, 'remove')),
  pageIgnoredUsers: require(path.join(__dirname, 'pageIgnoredUsers')),
  ignoreUser: require(path.join(__dirname, 'ignoreUser')),
  unignoreUser: require(path.join(__dirname, 'unignoreUser')),
  getMentionEmailSettings: require(path.join(__dirname, 'getMentionEmailSettings')),
  enableMentionEmails: require(path.join(__dirname, 'enableMentionEmails'))
];
