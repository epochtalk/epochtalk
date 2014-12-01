var path = require('path');
var breadcrumbs = require(path.join(__dirname, 'breadcrumbs')).routes;
var boards = require(path.join(__dirname, 'boards')).routes;
var threads = require(path.join(__dirname, 'threads')).routes;
var posts = require(path.join(__dirname, 'posts')).routes;
var users = require(path.join(__dirname, 'users')).routes;
var auth = require(path.join(__dirname,  'auth')).routes;

function buildEndpoints() {
  return [].concat(breadcrumbs, boards, threads, posts, users, auth);
}

exports.endpoints = buildEndpoints;
