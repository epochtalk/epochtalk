var path = require('path');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = require('code').expect;
var Promise = require('bluebird');
var db = require(path.join(__dirname, 'db'));
var seed = require(path.join(__dirname, 'seed', 'populate'));
var fixture = require(path.join(__dirname, 'fixtures', 'categories'));
var NotFoundError = Promise.OperationalError;

lab.experiment('Categories', function() {
  var runtime;
  var expectations = function(seededCategory, category) {
    expect(category).to.exist;
    expect(category.id).to.equal(seededCategory.id);
    expect(category.name).to.equal(seededCategory.name);
  };
  lab.before(function(done) {
    seed(fixture)
    .then(function(results) { runtime = results; })
    .then(function() { done(); });
  });
  lab.test('should return all categories', function(done) {
    db.categories.all().then(function(categories) {
      expect(categories).to.be.an.array();
      expect(categories).to.have.length(runtime.categories.length);
    })
    .then(function() { done(); });
  });
  lab.test('should find a category by id', function(done) {
    Promise.map(runtime.categories, function(seededCategory) {
      return db.categories.find(seededCategory.id).then(function(category) {
        expectations(seededCategory, category);
      })
      .catch(function(err) { throw err; });
    })
    .then(function() { done(); });
  });
  lab.test('should fail to find a category by invalid id', function(done) {
    db.categories.find()
    .then(function() {
      throw new Error('Should not have found a category');
    })
    .catch(function(err) {
      expect(err).to.be.an.instanceof(NotFoundError);
      expect(err.cause).to.be.a.string().and.to.equal('Category Not Found');
      done();
    });
  });
});
