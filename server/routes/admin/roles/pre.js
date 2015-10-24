var Boom = require('boom');
var path = require('path');

var defaultRoleIds = [
  'irXvScLORCGVJLtF8onULA', // Super Administrator
  'BoYOb5rATCqNnEFzQwYvuA', // Administrator
  '-w9wtzZST32hZgXuaOdCjQ', // Global Moderator
  'wNOXcRVBS3GRIq8HNsrSPQ', // Moderator
  '7c2Pd840RDO6hRf5sXo7YA', // User
  'Z6qgHsx0TD2bP1am9lRwmA', // Banned
  '2j9S2kjDRIeFm7uyloUD4Q', // Anonymous
  '80kyFis5QceKXgR1Qo0q9A', // Private
];

module.exports = {
  preventDefaultRoleDeletion: function(request, reply) {
    var roleId = request.params.id;
    var canDelete = true;
    if (defaultRoleIds.indexOf(roleId) > -1) {
      canDelete = Boom.badRequest('You may not delete the default roles.');
    }
    reply(canDelete);
  }
};
