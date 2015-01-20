var path = require('path');
var Hapi = require('hapi');
var Boom = require('boom');
var good = require('good');
var jwt = require('hapi-auth-jsonwebtoken');
var mkdirp = require('mkdirp');
var config = require(path.join(__dirname, 'config'));
var memDb = require('epochtalk-http-api/memstore').db;

var serverOpts = {
  // cors disabled by default
  host: 'localhost',
  port: config.port,
  routes: {
    files: { relativeTo: path.join(__dirname, 'public') },
    validate: {
      options: {
        stripUnknown: true
      }
    },
    security: {
      hsts: true,
      xframe: true,
      xss: true,
      noOpen: true,
      noSniff: true
    }
  }
};

var server = new Hapi.Server();
var connection = server.connection(serverOpts);

server.route([
{
  method: 'GET',
  path: '/static/{path*}',
  handler: {
    directory: {
      path: path.join(__dirname, 'public'),
      index: false
    }
  }
},
// index page
{
  method: 'GET',
  path: '/{path*}',
  handler: {
    file: 'index.html'
  }
}]);

// check if logging is enabled
var goodOpts = {};
if (config.logEnabled) {
  mkdirp.sync('./logs/server/operations');
  mkdirp.sync('./logs/server/errors');
  mkdirp.sync('./logs/server/requests');
  var logOpts = { extension: 'log', rotationTime: 1, format: 'YYYY-MM-DD-X' };
  goodOpts.reporters = [
    { reporter: require('good-console'), args:[{ log: '*', response: '*', error: '*' }] },
    { reporter: require('good-file'), args: ['./logs/server/operations/ops', { ops: '*' }, logOpts] },
    { reporter: require('good-file'), args: ['./logs/server/errors/errs', { error: '*' }, logOpts] },
    { reporter: require('good-file'), args: ['./logs/server/requests/reqs', { response: '*' }, logOpts] }
  ];
}
server.register({ register: good, options: goodOpts}, function (err) {
  if (err) { throw err; /* error loading the plugin */  }
});

/**
 * JWT
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

    if (err) {
      error = Boom.unauthorized('Session is no longer valid.');
    }

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

server.register(jwt, function(err) {
  if (err) { throw err; /* error loading the jwt plugin */ }
  // register auth strategy
  var strategyOptions = {
    key: config.privateKey,
    validateFunc: validate
  };
  server.auth.strategy('jwt', 'jwt', strategyOptions);
});

server.register({ register: require('epochtalk-http-api') }, function(err) {
  if (err) throw(err);
});

server.start(function () {
  server.log('debug', 'config: ' + JSON.stringify(config, undefined, 2));
  server.log('info', 'Epochtalk Frontend server started @' + server.info.uri);
});
