var path = require('path');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = require('code').expect;
var Promise = require('bluebird');
var db = require(path.join(__dirname, 'db'));
var seed = require(path.join(__dirname, 'seed', 'populate'));
var fixture = require(path.join(__dirname, 'fixtures', 'threads'));
var clean = require(path.join(__dirname, 'seed', 'clean'));
var NotFoundError = Promise.OperationalError;

lab.experiment('Threads', function() {
  var runtime;
  var expectations = function(seededThread, thread) {
    expect(thread).to.exist;
    expect(thread.board_id).to.equal(seededThread.board_id);
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
  lab.test('should find a thread by id', function(done) {
    Promise.map(runtime.threads, function(seededThread) {
      return db.threads.find(seededThread.id)
      .then(function(thread) {
        expectations(seededThread, thread);
      })
      .catch(function(err) {
        throw err;
      });
    })
    .then(function() {
      done();
    });
  });
  lab.test('should fail to find a thread by invalid id', function(done) {
    db.threads.find()
    .then(function(thread) {
      throw new Error('Should not have found a thread');
    })
    .catch(function(err) {
      expect(err).to.be.an.instanceof(NotFoundError);
      expect(err.cause).to.be.a.string().and.to.equal('Thread Not Found');
      done();
    });
  });
  lab.test('should return threads for a board', function(done) {
    Promise.map(runtime.boards.slice(0, 3), function(parentBoard) {
      return db.threads.byBoard(parentBoard.id)
      .then(function(threads) {
        expect(threads).to.exist;
        expect(threads.normal.length).to.equal(3);
      })
      .catch(function(err) {
        throw err;
      });
    })
    .then(function() {
      done();
    });
  });
  lab.test('should not return threads for a board', function(done) {
    Promise.map(runtime.boards.slice(3, 5), function(parentBoard) {
      return db.threads.byBoard(parentBoard.id)
      .then(function(threads) {
        expect(threads).to.exist;
        expect(threads.normal).to.have.length(0);
        expect(threads.sticky).to.have.length(0);
      })
      .catch(function(err) {
        throw err;
      });
    })
    .then(function() {
      done();
    });
  });
  lab.test('should return no threads for an invalid board', function(done) {
    db.threads.byBoard()
    .then(function(threads) {
      expect(threads).to.exist;
      expect(threads.normal).to.have.length(0);
      expect(threads.sticky).to.have.length(0);
    })
    .catch(function(err) {
      throw err;
    })
    .then(function() {
      done();
    });
  });
  lab.test('should increment board\'s thread count', function(done) {
    Promise.map(runtime.boards.slice(0, 3), function(seededBoard) {
      return db.boards.find(seededBoard.id)
      .then(function(board) {
        expect(board.thread_count).to.equal(3);
      })
      .catch(function(err) {
        throw err;
      });
    })
    .then(function() {
      done();
    });
  });
  lab.test('should increment its view count', function(done) {
    Promise.map(runtime.threads, function(seededThread) {
      return db.threads.incViewCount(seededThread.id)
      .catch(function(err) {
        throw err;
      });
    })
    .then(function() {
      return Promise.map(runtime.boards.slice(0, 3), function(parentBoard) {
        return db.threads.byBoard(parentBoard.id)
        .then(function(threads) {
          threads.normal.map(function(thread) {
            expect(thread.view_count).to.equal(1);
          });
        })
        .catch(function(err) {
          throw err;
        });
      });
    })
    .then(function() {
      done();
    });
  });
  lab.after(function(done) {
    clean().then(function() {
      done();
    });
  });
});
