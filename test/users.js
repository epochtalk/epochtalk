var path = require('path');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = require('code').expect;
var Promise = require('bluebird');
var db = require(path.join(__dirname, 'db'));
var seed = require(path.join(__dirname, 'seed', 'populate'));
var fixture = require(path.join(__dirname, 'fixtures', 'users'));
var clean = require(path.join(__dirname, 'seed', 'clean'));
var NotFoundError = Promise.OperationalError;

lab.experiment('Users', function() {
  var runtime;
  var expectations = function(seededUser, user) {
    expect(user).to.exist;
    expect(user.username).to.equal(seededUser.username);
    expect(user.email).to.equal(seededUser.email);
    expect(user.id).to.equal(seededUser.id);
  };
  lab.before({timeout: 5000}, function(done) {
    seed(fixture).then(function(results) {
      runtime = results;
    })
    .then(function() {
      done();
    });
  });
  lab.test('should fail to create a user with invalid parameters', function(done) {
    db.users.create({})
    .then(function(user) {
      expect(user).to.not.exist();
      throw new Error('User creation should have failed');
    })
    .catch(function(err) {
      done();
    });
  });
  lab.test('should return a user by username', function(done) {
    Promise.map(runtime.users, function(seededUser) {
      return db.users.userByUsername(seededUser.username).then(function(user) {
        expectations(seededUser, user);
      })
      .catch(function(err) {
        throw err;
      });
    })
    .then(function() {
      done();
    });
  });
  lab.test('should not return a user by invalid username', function(done) {
    db.users.userByUsername().then(function(user) {
      expect(user).to.not.exist();
    })
    .then(function() {
      done();
    })
    .catch(function(err) {
      throw err;
    });
  });
  lab.test('should return a user by email', function(done) {
    Promise.map(runtime.users, function(seededUser) {
      return db.users.userByEmail(seededUser.email).then(function(user) {
        expectations(seededUser, user);
      })
      .catch(function(err) {
        throw err;
      });
    })
    .then(function() {
      done();
    });
  });
  lab.test('should not return a user by invalid email', function(done) {
    db.users.userByEmail().then(function(user) {
      expect(user).to.be.undefined();
    })
    .then(function() {
      done();
    })
    .catch(function(err) {
      throw err;
    });
  });
  lab.test('should find a user by id', function(done) {
    Promise.map(runtime.users, function(seededUser) {
      return db.users.find(seededUser.id).then(function(user) {
        expectations(seededUser, user);
      })
      .catch(function(err) {
        throw err;
      });
    })
    .then(function() {
      done();
    });
  });
  lab.test('should fail to find a user by invalid id', function(done) {
    db.users.find()
    .then(function(user) {
      throw new Error('Should not have found a user');
    })
    .catch(function(err) {
      expect(err).to.be.an.instanceof(NotFoundError);
      expect(err.cause).to.be.a.string().and.to.equal('User Not Found');
      done();
    });
  });
  lab.after(function(done) {
    clean().then(function() {
      done();
    });
  });
});
