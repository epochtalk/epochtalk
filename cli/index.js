#!/usr/bin/env node
require('dotenv').load();
var path = require('path');
var program = require('commander');
var crypto = require('crypto');
var users = require(path.normalize(__dirname + '/../modules/ept-users')).db;
var categories = require(path.normalize(__dirname + '/../modules/ept-categories')).db;
var boards = require(path.normalize(__dirname + '/../modules/ept-boards')).db;
var config = require(path.join(__dirname, '..', 'config'));

var emailerOptions = config.emailer;
var emailer = require(path.normalize(__dirname + '/../server/plugins/emailer')).expose(emailerOptions);

program
  .version('0.0.1');

// the seed command
program
  .command('seed')
  .description('Seed database. Populates with initial user/board.')
  .action(function() {
    seed()
    .then(function() {
      process.exit(0);
    });
  });

// the create-user command
program
  .command('create-user <username> <email>')
  .description('Seed a user in the database')
  .option('--password <password>', 'Password for user')
  .option('--admin', 'Create the user as an admin account (default: false)')
  .action(function(username, email, options) {
    var options = {
      username,
      email,
      password: options.password,
      admin: options.admin || false
    };

    createUser(options)
    .then(function(result) {
      console.log('Created user', result);
      process.exit(0);
    })
    .catch(function(error) {
      console.log('Error creating user:', error);
      process.exit(1);
    });
  });

program.on('--help', function() {
  console.log('  Help on specific command: ' + program.name() + ' [command] --help');
});

program.parse(process.argv);

if (!program.args.length) {
  program.help();
}

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

function createUser(options) { // use email for password reset link
  var isAdmin = options.admin;

  // if both password and email are not provided,
  // don't create an account
  if (!options.password && !options.email) {
    return Promise.error('Email required for seed without password!');
  }
  // if no password is provided, but there is an email,
  // send the user an email with their reset link
  else if (!options.password && options.email) {
    console.log('Creating user and emailing password reset link to:', options.email);
    return users.create(options, isAdmin)
    .then(function(user) {
      var updateUser = {}; updateUser.reset_token = crypto.randomBytes(20).toString('hex');
      updateUser.reset_expiration = Date.now() + 1000 * 60 * 60; // 1 hr
      updateUser.id = user.id;
      // Store token and expiration to user object
      return users.update(updateUser);
    })
    // Email user reset information here
    .tap(function(user) {
      var emailParams = {
        email: user.email,
        username: user.username,
        site_name: 'EpochTalk',
        reset_url: process.env.PUBLIC_URL + '/' + path.join('reset', user.username, user.reset_token)
      };
      return emailer.send('recoverAccount', emailParams);
    });
  }
  // if a password is provided,
  // seed user with the password and confirmation
  else {
    console.log('Creating user with password:', options.password);
    options.confirmation = options.password;
    return users.create(options, isAdmin);
  }
};
