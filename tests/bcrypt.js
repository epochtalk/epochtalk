var assert = require('assert');
var bcrypt = require('bcrypt');

describe('auth', function() {
  describe('#bcrypt', function() {
    it('should hash and match', function() {
      var pass = 'password test';
      var hash = bcrypt.hashSync(pass, 10);
      var matchHash = bcrypt.compareSync('password test', hash);
      var msg = 'pass: ' + pass + ', hash: ' + hash;
      console.log(msg);
      assert.equal(true, matchHash, msg);
    });
  });
});



