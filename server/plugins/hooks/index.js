var _ = require('lodash');
var Promise = require('bluebird');

// -- internal methods

function preProcessing(request) {
  // find hookId for this route
  var hookId = _.get(request, 'route.settings.app.hook');

  // get methods by hookId
  var methods = _.get(request, 'hooks.' + hookId + '.pre') || [];

  // return the result of each method as any array
  return Promise.map(methods, function(method) {
    var output =  method(request);
    // short circuit out of hapi route using a Boom error
    if (output && output.isBoom) { return Promise.reject(output); }
    else { return output; }
  });
}

function parallelProcessing(request) {
  // find hookId for this route
  var hookId = _.get(request, 'route.settings.app.hook');

  // get methods by hookId
  var methods = _.get(request, 'hooks.' + hookId + '.parallel') || [];

  // return the result of each method as any array
  return Promise.map(methods, function(method) {
    return method(request);
  });
}

function mergeProcessing(request) {
  var parallelProcessed = request.pre.parallelProcessed || [];
  var processed = request.pre.processed;

  parallelProcessed.map(function(result) {
    if (!_.get(processed, result.path)) {
      _.set(processed, result.path, result.data); }
  });
}

function postProcessing(request) {
  // find hookId for this route
  var hookId = _.get(request, 'route.settings.app.hook');

  // get methods by hookId
  var methods = _.get(request, 'hooks.' + hookId + '.post') || [];

  // return the result of each method as any array
  return Promise.map(methods, function(method) {
    return method(request);
  });
}

// -- API


module.exports = {
  name: 'hooks',
  version: '1.0.0',
  register: async function(server, options) {
    options = options || {};
    options.hooks = options.hooks || [];
    server.decorate('request', 'hooks', options.hooks);

    // append hardcoded methods to the server
    var internalMethods = [
      {
        name: 'hooks.preProcessing',
        method: preProcessing
      },
      {
        name: 'hooks.parallelProcessing',
        method: parallelProcessing
      },
      {
        name: 'hooks.merge',
        method: mergeProcessing
      },
      {
        name: 'hooks.postProcessing',
        method: postProcessing
      }
    ];
    server.method(internalMethods);
  }
};
