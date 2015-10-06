module.exports = {
  createLookup: function(request, reply) {
    var camelize = function(str) {
      return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
        if (+match === 0) { return ''; }
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
      }).replace(/\W+/g, '');
    };
    request.payload.lookup = camelize(request.payload.name);
    return reply();
  }
};
