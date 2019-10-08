// Load modules
var Boom = require('boom');
var Hoek = require('@hapi/hoek');
var jwt  = require('jsonwebtoken');
var Promise = require('bluebird');


// Declare internals
var internals = {};
var redis;



module.exports = {
  name: 'jwt',
  version: '1.0.1',
  register: async function (server, options) {
    if (!options.redis) { return new Error('Redis not found in jwt'); }
    redis = options.redis;
    server.auth.scheme('jwt', internals.implementation);
  }
};


internals.implementation = function (server, options) {
  Hoek.assert(options, 'Missing jwt auth strategy options');
  Hoek.assert(options.key, 'Missing required private key in configuration');

  var settings = Hoek.clone(options);

  var scheme = {
    authenticate: function (request, reply) {
      return new Promise(function(resolve) {
        var req = request.raw.req;
        var authorization = req.headers.authorization;
        if (!authorization) {
          return resolve(reply.unauthenticated(Boom.badRequest('Bad HTTP authentication header format', 'Bearer')));
        }

        var parts = authorization.split(/\s+/);

        if (parts.length !== 2) {
          return resolve(reply.unauthenticated(Boom.badRequest('Bad HTTP authentication header format', 'Bearer')));
        }

        if (parts[0].toLowerCase() !== 'bearer') {
          return resolve(reply.unauthenticated(Boom.badRequest('Bad HTTP authentication header format', 'Bearer')));
        }

        if(parts[1].split('.').length !== 3) {
          return resolve(reply.unauthenticated(Boom.badRequest('Bad HTTP authentication header format', 'Bearer')));
        }

        var token = parts[1];

        jwt.verify(token, settings.key, { algorithms: ['HS256'] }, function(err, decoded) {
          if(err && err.message === 'jwt expired') {
            return resolve(reply.unauthenticated(Boom.unauthorized('Expired token received for JSON Web Token validation', 'Bearer'), { credentials: decoded }));
          }
          else if (err) {
            return resolve(reply.unauthenticated(Boom.unauthorized('Invalid signature received for JSON Web Token validation', 'Bearer'), { credentials: decoded }));
          }

          if (!settings.validateFunc) {
            return resolve(reply.continue({ credentials: decoded }));
          }

          settings.validateFunc(decoded, token, redis, function (err, isValid, credentials) {
            credentials = credentials || null;

            if (err) { return resolve(reply.unauthenticated(Boom.unauthorized(err.message), { credentials: credentials })); }

            if (!isValid) {
              return resolve(reply.unauthenticated(Boom.unauthorized('Invalid token', 'Bearer'), { credentials: credentials }));
            }

            if (!credentials || typeof credentials !== 'object') {
              return resolve(reply.unauthenticated(Boom.badImplementation('Bad credentials object received for jwt auth validation'), { log: { tags: 'credentials' } }));
            }
            // Authenticated
            return resolve(reply.authenticated({ credentials: credentials }));
          });
        });
      });
    }
  };

  return scheme;
};
