#!/usr/bin/env node
require('dotenv').load();
var path = require('path');
var program = require('commander');
var crypto = require('crypto');
var users = require(path.normalize(__dirname + '/../modules/ept-users')).db;
var categories = require(path.normalize(__dirname + '/../modules/ept-categories')).db;
var boards = require(path.normalize(__dirname + '/../modules/ept-boards')).db;
var config = require(path.join(__dirname, '..', 'config'));

var emailerOptions = config.emailer_env;
var emailer = require(path.normalize(__dirname + '/../server/plugins/emailer')).expose(emailerOptions);

program
  .version('0.0.1')
  .option('--seed', 'Seed database. Populates with initial user/board.')
  .option('--admin <email>', 'Seed database with admin account.')
  .parse(process.argv);

var genericArgs = {
  debug: program.debug,
  verbose: program.verbose,
};

var admin = function(adminEmail) {
  console.log('Creating admin with email:', adminEmail);
  return users.create({ username: 'admin', email: adminEmail }, true)
  .then(function(user) {
    var updateUser = {};
    updateUser.reset_token = crypto.randomBytes(20).toString('hex');
    updateUser.reset_expiration = Date.now() + 1000 * 60 * 60; // 1 hr
    updateUser.id = user.id;
    // Store token and expiration to user object
    return users.update(updateUser);
  })
  // Email user reset information here
  .then(function(user) {
    var emailParams = {
      email: user.email,
      username: user.username,
      site_name: 'EpochTalk',
      reset_url: process.env.PUBLIC_URL + '/' + path.join('reset', user.username, user.reset_token)
    };
    return emailer.send('recoverAccount', emailParams);
  })
  .catch(function(err) {
    console.log(err);
  });
};

var seed = function() {
  var adminUser = {
    username: 'admin',
    email: 'admin@epochtalk.com',
    password: 'admin1234',
    confirmation: 'admin1234'
  };
  var createdCategory;
  return users.create(adminUser, true)
  .then(function() {
    var generalCategory = { name: 'General' };
    return categories.create(generalCategory);
  })
  .then(function(category) {
    console.log('Created category: ' + category.name);
    createdCategory = category;
    var generalBoard = {
      name: 'General Discussion',
      description: 'The art of discussing, generally.'
    };
    return boards.create(generalBoard);
  })
  .then(function(board) {
    console.log('Created board: ' + board.name);
    var boardMapping = [
      {
        id: createdCategory.id,
        name: createdCategory.name,
        type: 'category',
        view_order: 0
      },
      {
        id: board.id,
        name: board.name,
        type: 'board',
        category_id: createdCategory.id,
        view_order: 0
      }
    ];
    return boards.updateCategories(boardMapping);
  })
  .then(function() {
    console.log('Added board to category');
  })
  .catch(function(err) {
    console.log(err);
  });
};

if (program.seed) {
  seed()
  .then(function() {
    process.exit(0);
  });
}
else if (program.admin) {
  return admin(program.admin)
  .then(function() {
    process.exit(0);
  });
}
else {
  program.help();
}
