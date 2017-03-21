var path = require('path');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = require('code').expect;
var Promise = require('bluebird');
var seed = require(path.join(__dirname, '..', 'seed', 'populate'));
var fixtures = {
  categories: require(path.join(__dirname, '..', 'fixtures', 'categories')),
  boards: require(path.join(__dirname, '..', 'fixtures', 'boards')),
  threads: require(path.join(__dirname, '..', 'fixtures', 'threads')),
};

lab.experiment('_Fixtures', function() {
  var runtime = {};
  lab.before(function(done) {
    return seed(fixtures.categories)
    .then(function(categories) {
      runtime.categories = categories;
      return seed(fixtures.users);
    })
    .then(function(boards) {
      runtime.boards = boards;
      return seed(fixtures.threads);
    })
    .then(function(threads) {
      runtime.threads = threads;
      return seed(fixtures.posts);
    });
  });
  lab.test('should have corresponding amount of runtime data', function(done) {
    Object.keys(fixtures).forEach(function(datatype) {
      Object.keys(fixtures[datatype].data).forEach(function(subDatatype) {
        expect(fixtures[datatype].data[subDatatype].length).to.equal(runtime[datatype][subDatatype].length);
      });
    });
    done();
  });
});
