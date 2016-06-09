#!/usr/bin/env node
require('dotenv').load();
var path = require('path');
var program = require('commander');
var users = require(path.normalize(__dirname + '/../modules/node_modules/ept-users')).db;
var categories = require(path.normalize(__dirname + '/../modules/node_modules/ept-categories')).db;
var boards = require(path.normalize(__dirname + '/../modules/node_modules/ept-boards')).db;

program
  .version('0.0.1')
  .option('--seed', 'Seed database. Populates with initial user/board.')
  .parse(process.argv);

var genericArgs = {
  debug: program.debug,
  verbose: program.verbose,
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
  seed();
}
else {
  program.help();
}
