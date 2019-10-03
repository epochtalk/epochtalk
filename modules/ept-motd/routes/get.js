/**
  * @apiVersion 0.4.0
  * @apiGroup MOTD
  * @api {GET} /motd Get Message of the Day
  * @apiName GetMOTD
  * @apiPermission User
  * @apiDescription Used to retrieve the message of the day
  *
  * @apiSuccess {string} motd The unparsed motd, may contain bbcode or markdown
  * @apiSuccess {string} motd_html The parsed motd html to display to users
  * @apiSuccess {boolean} main_view_only Lets the UI know to display on the main page or all pages
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the Message of the Day
  */
var get = {
  method: 'GET',
  path: '/api/motd',
  options: {
    auth: { mode: 'try', strategy: 'jwt' },
    plugins: { track_ip: true },
    pre: [ { method: (request) => request.server.methods.auth.motd.get(request.server, request.auth) } ]
  },
  handler: function(request) {
    var promise = request.db.motd.get()
    .then(function(data) {
      return {
        motd: data.motd || "",
        motd_html: request.parser.parse(data.motd),
        main_view_only: data.main_view_only || false
      };
    })
    .error(request.errorMap.toHttpError);
    return promise;
  }
};
