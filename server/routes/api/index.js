var path = require('path');
var breadcrumbs = require(path.join(__dirname, 'breadcrumbs'));
var boards = require(path.join(__dirname, 'boards'));
var threads = require(path.join(__dirname, 'threads'));
var posts = require(path.join(__dirname, 'posts'));
var users = require(path.join(__dirname, 'users'));
var auth = require(path.join(__dirname,  'auth'));

function buildEndpoints() {
  return [].concat(breadcrumbs, boards, threads, posts, users, auth);
}

exports.endpoints = buildEndpoints;
