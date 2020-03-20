var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Breadcrumbs
  * @api {GET} /breadcrumbs Find
  * @apiName FindBreadcrumbs
  * @apiDescription Used to get the breadcrumbs from board, thread, category or post id
  *
  * @apiParam (Query) {string} id The unique id of the board, thread, category or post to retrieve breadcrumbs for
  * @apiParam (Query) {string} type The type of the id being provided (board, category, thread, or post)
  *
  * @apiSuccess {object[]} breadcrumbs Array containing breadcrumb objects
  * @apiSuccess {string} breadcrumbs.label Label for the breadcrumb link
  * @apiSuccess {string} breadcrumbs.state State for backing the label
  * @apiSuccess {object} breadcrumbs.opts State options to pass to ui-sref, can include id or hash
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the breadcrumbs
  */
module.exports = {
  method: 'GET',
  path: '/api/breadcrumbs',
  options: {
    auth: { mode: 'try', strategy: 'jwt' },
    validate: {
      query: Joi.object({
        id: Joi.string().required(),
        type: Joi.string().required()
      })
    }
  },
  handler: function(request) {
    return request.db.breadcrumbs.getBreadcrumbs(request.query.id, request.query.type, request)
    .error(request.errorMap.toHttpError);
  }
};
