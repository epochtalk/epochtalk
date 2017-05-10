var path = require('path');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var expect = require('code').expect;
var Promise = require('bluebird');
var db = require(path.join(__dirname, 'db'));
var seed = require(path.join(__dirname, 'seed', 'populate'));
var fixture = require(path.join(__dirname, 'fixtures', 'notifications'));
var clean = require(path.join(__dirname, 'seed', 'clean'));
var NotFoundError = Promise.OperationalError;
var CreationError = Promise.OperationalError;

lab.experiment('Notifications', function() {
  var runtime;
  lab.before({timeout: 5000}, function(done) {
    seed(fixture)
    .then(function(results) {
      runtime = results;
    })
    .then(function() {
      done();
    });
  });
  lab.test('should create a notification for a user', function(done) {
    db.notifications.create({ sender_id: runtime.users[3].id, receiver_id: runtime.users[3].id, type: 'test' })
    .then(function(notification) {
      expect(notification).to.exist;
      expect(notification.id).to.exist;
      expect(notification.created_at).to.be.a.date();
      expect(notification.viewed).to.be.false();
    })
    .then(function() {
      done();
    })
    .catch(function(err) {
      throw err;
    });
  });
  lab.test('should not create a notification for invalid sender_id', function(done) {
    Promise.resolve().then(function() {
      db.notifications.create({ sender_id: 'garbage_id', receiver_id: runtime.users[3].id, type: 'test' })
      .catch(function(err) {
        expect(err).to.be.instanceof(CreationError);
      });
    })
    .then(done);
  });
  lab.test('should not create a notification for invalid receiver_id', function(done) {
    Promise.resolve().then(function() {
      db.notifications.create({ sender_id: runtime.users[3].id, receiver_id: 'garbage_id', type: 'test' })
      .catch(function(err) {
        expect(err).to.be.instanceof(CreationError);
      });
    })
    .then(done);
  });
  lab.test('should not create a notification without type', function(done) {
    Promise.resolve().then(function() {
      db.notifications.create({ sender_id: runtime.users[3].id, receiver_id: runtime.users[3].id })
      .catch(function(err) {
        expect(err).to.be.instanceof(CreationError);
      });
    })
    .then(done);
  });
  lab.test('should not create a notification without options', function(done) {
    Promise.resolve().then(function() {
      db.notifications.create()
      .catch(function(err) {
        expect(err).to.be.instanceof(CreationError);
      });
    })
    .then(done);
  });
  lab.test('should return message notifications for a user', function(done) {
    Promise.map(runtime.users, function(user) {
      return db.notifications.latest(user.id, { type: 'message' })
      .then(function(notifications) {
        expect(notifications).to.exist;
      })
      .catch(function(err) {
        throw err;
      });
    })
    .then(function() {
      done();
    });
  });
  lab.test('should return mention notifications for a user', function(done) {
    Promise.map(runtime.users, function(user) {
      return db.notifications.latest(user.id, { type: 'mention' })
      .then(function(notifications) {
        expect(notifications).to.exist;
      })
      .catch(function(err) {
        throw err;
      });
    })
    .then(function() {
      done();
    });
  });
  lab.test('should return default paged message notifications for a user', function(done) {
    Promise.resolve(runtime.users[0]).then(function(user) {
      // this is the default paging limit
      return db.notifications.latest(user.id, { type: 'message' })
      .then(function(notifications) {
        expect(notifications).to.exist;
        expect(notifications).to.have.length(15);
      })
      .then(function() {
        // this is the first page of notifications
        return db.notifications.latest(user.id, { type: 'message', page: 1 });
      })
      .then(function(notifications) {
        expect(notifications).to.exist;
        expect(notifications).to.have.length(15);
      })
      .then(function() {
        // this is the second page of notifications
        return db.notifications.latest(user.id, { type: 'message', page: 2 });
      })
      .then(function(notifications) {
        expect(notifications).to.exist;
        expect(notifications).to.have.length(3);
      })
      .catch(function(err) {
        throw err;
      });
    })
    .then(function() {
      done();
    });
  });
  lab.test('should return default paged mention notifications for a user', function(done) {
    Promise.resolve(runtime.users[0]).then(function(user) {
      // this is the default paging limit
      return db.notifications.latest(user.id, { type: 'mention' })
      .then(function(notifications) {
        expect(notifications).to.exist;
        expect(notifications).to.have.length(15);
      })
      .then(function() {
        // this is the first page of notifications
        return db.notifications.latest(user.id, { type: 'mention', page: 1 });
      })
      .then(function(notifications) {
        expect(notifications).to.exist;
        expect(notifications).to.have.length(15);
      })
      .then(function() {
        // this is the second page of notifications
        return db.notifications.latest(user.id, { type: 'mention', page: 2 });
      })
      .then(function(notifications) {
        expect(notifications).to.exist;
        expect(notifications).to.have.length(3);
      })
      .catch(function(err) {
        throw err;
      });
    })
    .then(function() {
      done();
    });
  });
  lab.test('should not return notifications for a user for empty page', function(done) {
    Promise.resolve(runtime.users[0]).then(function(user) {
      // this is the default paging limit
      return db.notifications.latest(user.id, { type: 'message', page: 3 })
      .then(function(notifications) {
        expect(notifications).to.not.exist;
        expect(notifications).to.have.length(0);
      })
      .catch(function(err) {
        throw err;
      });
    })
    .then(function() {
      done();
    });
  });
  lab.test('should return limited paged notifications for a user', function(done) {
    Promise.resolve(runtime.users[0]).then(function(user) {
      // this is the default paging limit
      return db.notifications.latest(user.id, { type: 'message', limit: 1 })
      .then(function(notifications) {
        expect(notifications).to.exist;
        expect(notifications).to.have.length(1);
      })
      .then(function() {
        return db.notifications.latest(user.id, { type: 'message', limit: 10, page: 2 });
      })
      .then(function(notifications) {
        expect(notifications).to.exist;
        expect(notifications).to.have.length(8);
      })
      .then(function() {
        return db.notifications.latest(user.id, { type: 'message', limit: 20 });
      })
      .then(function(notifications) {
        expect(notifications).to.exist;
        expect(notifications).to.have.length(18);
      })
      .catch(function(err) {
        throw err;
      });
    })
    .then(function() {
      done();
    });
  });
  lab.test('should not return notifications for empty limited page', function(done) {
    Promise.resolve(runtime.users[0]).then(function(user) {
      // this is the default paging limit
      return db.notifications.latest(user.id, { type: 'message', limit: 20, page: 2 })
      .then(function(notifications) {
        expect(notifications).to.not.exist;
        expect(notifications).to.have.length(0);
      })
      .then(function() {
        return db.notifications.latest(user.id, { type: 'message', limit: 1, page: 19 });
      })
      .then(function(notifications) {
        expect(notifications).to.not.exist;
        expect(notifications).to.have.length(0);
      })
      .catch(function(err) {
        throw err;
      });
    })
    .then(function() {
      done();
    });
  });
  lab.test('should return user notifications counts', function(done) {
    Promise.resolve(runtime.users[0]).then(function(user) {
      return db.notifications.counts(user.id)
      .then(function(counts) {
        expect(counts.message).to.exist;
        expect(counts.message).to.equal('10+');
        expect(counts.mention).to.exist;
        expect(counts.mention).to.equal('10+');
      })
      .catch(function(err) {
        throw err;
      });
    })
    .then(function() {
      return runtime.users[1];
    })
    .then(function(user) {
      return db.notifications.counts(user.id)
      .then(function(counts) {
        expect(counts.message).to.exist;
        expect(counts.message).to.equal('10+');
        expect(counts.mention).to.not.exist;
        expect(counts.mention).to.equal(0);
      })
      .catch(function(err) {
        throw err;
      });
    })
    .then(function() {
      return runtime.users[2];
    })
    .then(function(user) {
      return db.notifications.counts(user.id)
      .then(function(counts) {
        expect(counts.message).to.exist;
        expect(counts.message).to.equal(3);
        expect(counts.mention).to.exist;
        expect(counts.mention).to.equal(3);
      })
      .catch(function(err) {
        throw err;
      });
    })
    .then(function() {
      done();
    });
  });
  lab.test('should dismiss notifications', function(done) {
    Promise.resolve(runtime.users[0]).then(function(user) {
      // this is the default paging limit
      return db.notifications.dismiss({ receiver_id: user.id, type: 'message' })
      .then(function() { return db.notifications.counts(user.id); })
      .then(function(counts) {
        expect(counts.message).to.equal(0);
        expect(counts.mention).to.equal('10+');
      })
      .then(function() { return db.notifications.counts(runtime.users[1].id); })
      .then(function(counts) {
        expect(counts.message).to.equal('10+');
      })
      .then(function() {
        return db.notifications.latest(user.id, { type: 'message' });
      })
      .then(function(notifications) {
        expect(notifications).to.have.length(0);
      })
      .then(function(notifications) {
        return db.notifications.dismiss({ receiver_id: user.id, type: 'message' })
        .catch(function(err) {
          expect(err).to.not.exist();
        });
      })
      .catch(function(err) {
        throw err;
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
