#!/usr/bin/env node
require('dotenv').load();
var path = require('path');
var users = require(path.normalize(__dirname + '/../modules/ept-users')).db;

var seed = function() {
  var adminUser = {
    username: 'epochtalk-admin',
    email: 'admin@epochtalk.com',
    password: 'admin1234',
    confirmation: 'admin1234'
  };
  return users.create(adminUser, true)
  .then(function(user) {
    console.log("Created User: " + user);
  })
  .catch(function(err) {
    console.log(err);
  });
};

seed();
