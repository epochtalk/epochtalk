var path = require('path');
var program = require('commander');
var db = require(path.normalize(__dirname + '/../db'));

program
  .version('0.0.1')
  .option('--create', 'Create database.')
  .parse(process.argv);

var genericArgs = {
  debug: program.debug,
  verbose: program.verbose,
};

if (program.create) {
  var adminUser = {
    username: 'admin',
    email: 'admin@epochtalk.com',
    password: 'admin1234',
    confirmation: 'admin1234'
  }
  db.users.create(adminUser, true)
  .then(function() {
    var generalCategory = { name: 'General' };
    return db.categories.create(generalCategory);
  })
  .then(function(category) {
    console.log('Created category: ' + category.name);
    var generalBoard = {
      category_id: category.id,
      name: 'General Discussion',
      description: 'The art of discussing, generally.'
    };
    return db.boards.create(generalBoard);
  })
  .then(function(board) {
    console.log('Created board: ' + board.name);
  })
  .then(function() {
    db.close();
  })
  .catch(function(err) {
    console.log(err);
    db.close();
  });
}
else {
  program.help();
}
