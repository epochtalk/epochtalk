#!/usr/bin/env node
require('dotenv').load();
var path = require('path');
var program = require('commander');
var db = require(path.normalize(__dirname + '/../db'));

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
  db.users.create(adminUser, true)
  .then(function() {
    var generalCategory = { name: 'General' };
    return db.categories.create(generalCategory);
  })
  .then(function(category) {
    console.log('Created category: ' + category.name);
    createdCategory = category;
    var generalBoard = {
      name: 'General Discussion',
      description: 'The art of discussing, generally.'
    };
    return db.boards.create(generalBoard);
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
    return db.boards.updateCategories(boardMapping);
  })
  .then(function() {
    console.log('Added board to category');
    db.close();
  })
  .catch(function(err) {
    console.log(err);
    db.close();
  });
};

if (program.seed) {
  seed();
}
else {
  program.help();
}
