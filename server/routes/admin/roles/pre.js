module.exports = {
  createLookup: function(request, reply) {
    var camelize = function(str) {
      return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
        if (+match === 0) { return ''; }
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
      }).replace(/\W+/g, '');
    };
    var defaultRoleIds = [
      '8ab5ef49-c2ce-4421-9524-bb45f289d42c', // Super Administrator
      '06860e6f-9ac0-4c2a-8d9c-417343062fb8', // Administrator
      'fb0f70b7-3652-4f7d-a166-05ee68e7428d', // Global Moderator
      'c0d39771-1541-4b71-9122-af0736cad23d', // Moderator
      'edcd8f77-ce34-4433-ba85-17f9b17a3b60', // User
      '67aaa01e-cc74-4c3d-9b3f-56a6f6547098', // Banned
      'da3f52da-48c3-4487-859b-bbb2968503e1', // Anonymous
      'f3493216-2b39-41c7-8a5e-0475428d2af4', // Private
    ];
    // modifying default role do not change lookup, but allow name change
    if (defaultRoleIds.indexOf(request.payload.id) > -1) {
      request.payload.lookup = camelize(request.payload.name);
    }
    // modifying non default role camelize lookup make sure generated lookup isn't reserved
    else {
      request.payload.lookup = camelize(request.payload.name);
      var reservedLookups = [
        'superAdministrator',
        'administrator',
        'globalModerator',
        'moderator',
        'user',
        'banned',
        'anonymous',
        'private'
      ];
      // Prevent creating new roles with default lookup value
      if (reservedLookups.indexOf(request.payload.lookup) > -1) {
        request.payload.lookup = request.payload.lookup + parseInt(Math.random() * 100, 10);
      }
    }
    return reply();
  }
};
