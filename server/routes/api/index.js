var boards = require(__dirname + '/boards');
var threads = require(__dirname + '/threads');
var posts = require(__dirname + '/posts');
var users = require(__dirname + '/users');
var auth = require(__dirname + '/auth');

function buildEndpoints() {
  return [].concat(boards, threads, posts, users, auth);
}

exports.endpoints = buildEndpoints;
