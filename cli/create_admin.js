#!/usr/bin/env node
require('dotenv').load();
var path = require('path');
var users = require(path.normalize(__dirname + '/../modules/node_modules/ept-users')).db;
var categories = require(path.normalize(__dirname + '/../modules/node_modules/ept-categories')).db;
var boards = require(path.normalize(__dirname + '/../modules/node_modules/ept-boards')).db;

var seed = function() {
  var adminUser = {
    username: 'slickage-admin',
    email: 'admin@epochtalk.com',
    password: 'admin1234',
    confirmation: 'admin1234'
  };
  var createdCategory;
  return users.create(adminUser, true)
  .then(function(user) {
    console.log("Created User: " + user);
  })
  .catch(function(err) {
    console.log(err);
  });
};

seed();
