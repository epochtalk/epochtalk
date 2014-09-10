var core = require('epochcore')();
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var redis = require('redis');
var path = require('path');
var config = require(path.join(__dirname, '..', '..', '..', 'config'));
var redisClient = redis.createClient(config.redis.port, config.redis.host);
// var authSchema = require(path.join('..', 'schema', 'auth'));

exports.login = {
  handler: function(request, reply) {

    console.log(request.auth);

    // check if already logged in with jwt
    if (request.auth.isAuthenticated) {
      console.log('already logged in');
      // reply with token
      return reply(request.auth.crendentials.token);
    }

    // input validation (username and password)
    if (!request.payload.username || !request.payload.password) {
      var message = 'Missing usernmae or password';
      return reply(message);
    }

    // check if user exists
    var username = request.payload.username;
    var password = request.payload.password;
    return core.users.userByUsername(username)
    .then(function(user) {
      // generate passhash from password
      var passhash = bcrypt.hashSync(password, 12);

      // check if passhas matches
      if (passhash === user.passhash) {
        return user;
      }
      else {
        throw new Error('Invalid Crendentials');
      }
    })
    .then(function(user) {
      // decodedToken: what we're going to encode into the token
      var decodedToken = {
        id: user.id,
        username: user.username,
        email: user.email
      };

      // build jwt token from user
      var token = jwt.sign(decodedToken, config.privateKey);

      // save token to redis
      redisClient.set(user.id, token, function(err) {
        if (err) { throw new Error(err); }

        // return token to user
        return reply(token);
      });
    })
    .catch(function(err) {
      console.log("in login handler catch");
      console.log(err);
      return reply(err);
    });
  },
  auth: {
    mode: 'try',
    strategy: 'jwt'
  }
};

exports.logout = {
  handler: function(request, reply) {

    console.log(request.auth);

    // check if already logged in with jwt
    if (!request.auth.isAuthenticated) {
      console.log('Not Logged In');
      return reply('Not Logged In');
    }

    var credentials = request.auth.credentials;
    var id = credentials.id;

    // delete jwt from redis 
    redisClient.del(id, function(err, value) {
      return reply(true);
    });
  },
  auth: {
    mode: 'try',
    strategy: 'jwt'
  }
};

exports.register = {
  handler: function(request, reply) {

    console.log(request.auth);

    // check if already logged in with jwt
    if (request.auth.isAuthenticated) {
      console.log('already logged in');
      // reply with token
      return reply(request.auth.crendentials.token);
    }


    return reply(true);
  },
  auth: {
    mode: 'try',
    strategy: 'jwt'
  }
};

exports.refreshToken = {
  handler: function(request, reply) {
    return reply(true);
  }
};