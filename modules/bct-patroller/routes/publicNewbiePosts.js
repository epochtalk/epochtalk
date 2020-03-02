/**
  * @apiVersion 0.4.0
  * @apiGroup Roles
  * @api {GET} /admin/roles/all All Roles
  * @apiName AllRoles
  * @apiPermission Super Administrator, Administrator
  * @apiDescription Retrieve all role.
  *
  * @apiSuccess {object[]} roles An array of all the roles.
  * @apiSuccess {string} roles.id The unique id of the role
  * @apiSuccess {string} roles.name The name of the role
  * @apiSuccess {string} roles.description The description of the role
  * @apiSuccess {string} roles.lookup A unique identifier for the role
  * @apiSuccess {number{0..n}} roles.priority The priority of the role, with 0 being the highest priority
  * @apiSuccess {string} roles.highlight_color An html hex value color used to highlight users based on their role
  * @apiSuccess {object} permissions An object containing all this roles permissions
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the roles.
  */
module.exports = {
  method: 'GET',
  path: '/api/posts/newbie',
  options: {
    auth: { strategy: 'jwt' },
    // pre: [ { method: (request) => request.server.methods.auth.roles.all(request.server, request.auth) } ]
  },
  handler: function(request) {
    var promise = request.db.patroller.publicNewbiePosts(request)
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
