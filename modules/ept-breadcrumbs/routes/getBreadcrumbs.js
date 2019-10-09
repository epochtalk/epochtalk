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

    // method type enum
    var findType = {
      board: request.db.boards.breadcrumb,
      category: request.db.categories.find,
      thread: request.db.threads.breadcrumb,
      post: request.db.posts.find
    };

    // Type enum
    var type = {
      board: 'board',
      category: 'category',
      thread: 'thread',
    };

    // Recursively Build breadcrumbs
    var buildCrumbs = function(id, curType, crumbs) {
      if (!id) { return crumbs; }
      return findType[curType](id)
      .then(function(obj) {
        var nextType, nextId;
        if (curType === type.category) { // Category
          var catName = obj.name;
          var anchor = (obj.name + '-' + obj.view_order).replace(/\s+/g, '-').toLowerCase();
          crumbs.push({ label: catName, state: '^.boards', opts: { '#': anchor }});
        }
        else if (curType === type.board) { // Board
          if (!obj.parent_id && obj.category_id) { // Has no Parent
            nextType = type.category;
            nextId = obj.category_id;
          }
          else { // Has Parent
            nextType = type.board;
            nextId = obj.parent_id;
          }
          crumbs.push({ label: obj.name, state: 'threads.data', opts: { boardId: id } });
        }
        else if (curType === type.thread) { // Thread
          crumbs.push({ label: obj.title, state: 'posts.data', opts: { threadId: id } });
          nextType = type.board;
          nextId = obj.board_id;
        }
        return buildCrumbs(nextId, nextType, crumbs);
      });
    };

    // Build the breadcrumbs and reply
    return buildCrumbs(request.query.id, request.query.type, [])
    .then(function(breadcrumbs) { return breadcrumbs.reverse(); })
    .error(request.errorMap.toHttpError);
  }
};
