var path = require('path');
var boards = require(path.join(__dirname, 'boards'));
var threads = require(path.join(__dirname, 'threads'));
var posts = require(path.join(__dirname, 'posts'));
var users = require(path.join(__dirname, 'users'));
var auth = require(path.join(__dirname,  'auth'));

function buildEndpoints() {
  return [].concat(boards, threads, posts, users, auth);
}

exports.endpoints = buildEndpoints;
