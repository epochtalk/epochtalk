var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Boards
  * @api {GET} /boards/:slug/id Convert Board Slug to Id
  * @apiName SlugToBoardId
  * @apiDescription Used to retrieve a board's id via is slug.
  *
  * @apiParam {string} slug The slug of the board
  *
  * @apiSuccess {string} id The unqiue id of the board
  *
  * @apiError (Error 500) InternalServerError There was an issue finding a board with the provided slug
  */
module.exports = {
  method: 'GET',
  path: '/api/boards/{slug}/id',
  options: {
    app: { hook: 'boards.slugToThreadId' },
    validate: { params: Joi.object({ slug: Joi.string().regex(/^[a-zA-Z0-9-~!@)(_+:'"\.](-?[a-zA-Z0-9-~!@)(_+:'"\.])*$/).min(1).max(100).required() }) }
  },
  handler: function(request) {
    var slug = request.params.slug;

    // create the thread
    var promise = request.db.boards.slugToBoardId(slug)
    .then(function(boardId) { return { id: boardId }; })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
