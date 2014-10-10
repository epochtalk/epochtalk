/* jshint node: true */
'use strict';

var path = require('path');
var Hapi = require('hapi');
var good = require('good');
var Blankie = require('blankie');
var Scooter = require('scooter');
var jwt = require('hapi-auth-jsonwebtoken');
var config = require(path.join(__dirname, 'config'));
var memDb = require(path.join(__dirname, 'memStore')).db;

var serverOpts = {
  // cors disabled by default
  security: {
    hsts: true,
    xframe: true,
    xss: true,
    noOpen: true,
    noSniff: true
  },
  files: {
    relativeTo: path.join(__dirname, "../public")
  }
};
var server = Hapi.createServer('localhost', config.port, serverOpts);

// server caching
// server.cache

// JWT Goodness
/**
  * token, original unadulterated token
  * decodedToken, the decrypted value in the token
  *   -- { username, user_id, email }
  * cb(err, isValid, credentials), 
  *   -- isValid, if true if decodedToken matches a user token
  *   -- credentials, the user short object to be tied to request.auth.credentials
  */
var validate = function(token, decodedToken, cb) {
  // get id from decodedToken to query memDown with for token
  var user_id = decodedToken.id;
  memDb.get(user_id, function(err, savedToken) {
    var error;
    var isValid = false;
    var credentials = {};

    if (err) { error = Hapi.error.unauthorized('Session is no longer valid.'); }

    // check if the token from memDown matches the token we got in the request
    // if it matches, then the token from the request is still valid
    if (!error && token === savedToken) {
      isValid = true;
      credentials.id = decodedToken.id;
      credentials.username = decodedToken.username;
      credentials.email = decodedToken.email;
      credentials.token = token;
    }

    // return if token valid with user credentials
    return cb(error, isValid, credentials);
  });
};
// register auth scheme
server.pack.register(jwt, function(err) {
  if (err) { throw err; /* error loading the jwt plugin */ }
  // register auth strategy
  var strategyOptions = {
    key: config.privateKey,
    validateFunc: validate
  };
  server.auth.strategy('jwt', 'jwt', strategyOptions);
});

// api routes
var routes = require(__dirname + '/routes');
server.route(routes.endpoints());


// CSP
server.pack.register([Scooter, {
  plugin: Blankie,
  options: {
    defaultSrc: 'none',
    scriptSrc: ['self', "'nonce-sabc123'"],
    styleSrc: ['unsafe-inline', 'http://netdna.bootstrapcdn.com'],
    fontSrc: ['self', 'http://netdna.bootstrapcdn.com'],
    imgSrc: 'self',
    connectSrc: ['self', 'ws://localhost', 'ws://127.0.0.1:35729/livereload']
  }
}] , function(err) {
  if (err) { throw err; }
});


// register server route logging
server.pack.register(good, function (err) {
  if (err) { throw err; /* error loading the plugin */  }
});

// start server
server.start(function () {
  server.log('debug', 'config: ' + JSON.stringify(config, undefined, 2));
  server.log('info', 'Epochtalk Frontend server started @' + server.info.uri);
});

// debug: print routes
// var table = server.table();
// console.log(table);
