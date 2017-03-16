var path = require('path');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = require('code').expect;
var Promise = require('bluebird');
var db = require(path.join(__dirname, 'db'));
var seed = require(path.join(__dirname, 'seed', 'populate'));
var fixture = require(path.join(__dirname, 'fixtures', 'boards'));
var NotFoundError = Promise.OperationalError;

lab.experiment('Boards', function() {
  var runtime;
  var expectations = function(seededBoard, board) {
    expect(board).to.exist;
    expect(board.name).to.equal(seededBoard.name);
    expect(board.description).to.equal(seededBoard.description);
    expect(board.id).to.equal(seededBoard.id);
  };
  lab.before({timeout: 5000}, function(done) {
    seed(fixture)
    .then(function(results) {
      runtime = results;
    })
    .then(function() {
      done();
    });
  });
  lab.test('should return all boards', function(done) {
    db.boards.all()
    .then(function(boards) {
      expect(boards).to.be.an.array();
      expect(boards).to.have.length(runtime.boards.length);
    })
    .then(function() {
      done();
    });
  });
  lab.test('should find a board by id', function(done) {
    Promise.map(runtime.boards, function(seededBoard) {
      return db.boards.find(seededBoard.id)
      .then(function(board) {
        expectations(seededBoard, board);
      })
      .catch(function(err) {
        throw err;
      });
    })
    .then(function() {
      done();
    });
  });
  lab.test('should fail to find a board by invalid id', function(done) {
    db.boards.find()
    .then(function(board) {
      throw new Error('Should not have found a board');
    })
    .catch(function(err) {
      expect(err).to.be.an.instanceof(NotFoundError);
      expect(err.cause).to.be.a.string().and.to.equal('Board Not Found');
      done();
    });
  });
});
