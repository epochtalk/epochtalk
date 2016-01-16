var Joi = require('joi');
var path = require('path');
var Boom = require('boom');
var db = require(path.normalize(__dirname + '/../../../db'));

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
  * @apiSuccess {array} breadcrumbs Array containing breadcrumb objects
  * @apiSuccess (Breadcrumb Object) {string} label Label for the breadcrumb link
  * @apiSuccess (Breadcrumb Object) {string} state State for backing the label
  *
  * @apiError (Error 500) InternalServerError There was an issue retrieving the breadcrumbs
  */
exports.byType = {
  auth: { mode: 'try', strategy: 'jwt' },
  validate: {
    query: {
      id: Joi.string().required(),
      type: Joi.string().required()
    }
  },
  handler: function(request, reply) {

    // method type enum
    var findType = {
      board: db.boards.breadcrumb,
      category: db.categories.find,
      thread: db.threads.breadcrumb,
      post: db.posts.find
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
          crumbs.push({ label: obj.name, state: 'board.data', opts: { boardId: id } });
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
    .then(function(breadcrumbs) { reply(breadcrumbs.reverse()); })
    .catch(function(err) { reply(Boom.badImplementation(err));});
  }
};
