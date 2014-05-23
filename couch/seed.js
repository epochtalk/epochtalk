var config = require(__dirname + '/../server/config');
var nano = require('nano')(config.couchdb.url);
var dbName = config.couchdb.name;
var db = nano.use(dbName);
var Charlatan = require('charlatan');
var async = require('async');
var seed = {};
module.exports = seed;

var numUsers = 10000;
var numMods = 10;
var numBoards = 25;
var maxPosts = 15;

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

var generateUser = function() {
  var name = Charlatan.Internet.userName();
  var email = Charlatan.Internet.freeEmail(name);
  var createdDate = randomDate(new Date(2012, 0, 1), new Date());
  var timestamps = {
    created: createdDate.getTime(),
    updated: Charlatan.Helpers.rand(10, 0) > 8 ? randomDate(createdDate, new Date()).getTime() : null
  };
  var user = {
    username: name,
    email: email,
    timestamps: timestamps,
    type: 'user'
  };
  return user;
};

var generateBoard = function(moderatorIds, parentBoard) {
  var words = Charlatan.Lorem.words(Charlatan.Helpers.rand(8, 1));
  words[0] = Charlatan.Helpers.capitalize(words[0]);
  var name = words.join(' ');
  var description = Charlatan.Lorem.paragraph();
  var createdDate = parentBoard ? randomDate(new Date(parentBoard.timestamps.created), new Date()) : randomDate(new Date(2012, 0, 1), new Date());
  var timestamps = {
    created: createdDate.getTime(),
    updated: Charlatan.Helpers.rand(10, 0) > 8 ? randomDate(createdDate, new Date()).getTime() : null
  };
  var board = {
    name: name,
    description: description,
    moderator_ids: moderatorIds,
    parent_board_id: parentBoard ? parentBoard._id : undefined,
    timestamps: timestamps,
    type: 'board'
  };
  return board;
};

var generatePost = function(authorId, boardId, previousPostTime, parentPostId) {
  var words = Charlatan.Lorem.words(Charlatan.Helpers.rand(8, 1));
  words[0] = Charlatan.Helpers.capitalize(words[0]);
  var subject = words.join(' ');
  var paragraphCount = Charlatan.Helpers.rand(10, 1);
  var body = Charlatan.Lorem.text(paragraphCount, false, '<br /><br />');
  var createdDate;
  if (previousPostTime) { // generate next post within 1 week of previous
    var oldDate = new Date(previousPostTime);
    var futureDate = new Date(Number(previousPostTime) + 1000 * 60 * 60 * 24 * 7);
    createdDate = randomDate(oldDate, futureDate);
  }
  else { // if this is a top leel post just generate a random date.
    createdDate = randomDate(new Date(2012, 0, 1), new Date());
  }
  var timestamps = {
    created: createdDate.getTime(),
    updated: Charlatan.Helpers.rand(10, 0) > 8 ? randomDate(createdDate, new Date()).getTime() : null
  };
  var post = {
    subject: subject,
    body: body,
    author_id: authorId,
    board_id: boardId ? boardId : undefined,
    parent_post_id: parentPostId ? parentPostId : undefined,
    timestamps: timestamps,
    type: 'post'
  };
  return post;
};

function seedUsers(seedUsersCallback) {
  var users = [];
  var i = 0;
  async.whilst(
    function() {
      return i < numUsers;
    },
    function (cb) {
      var user = generateUser();
      db.insert(user, function(err, body) {
        user._id = body.id;
        process.stdout.write('Generating Users: ' + user._id + '\r');
        users.push(user);
        i++;
        cb(err);
      });
    },
    function (err) {
      if (err) {
        console.log('Error generating users.');
      }
      seedUsersCallback(err, users);
    }
  );
}

function seedBoards(users, parentBoard, seedBoardsCallback) {
  var mods = users.slice(0, numMods);
  var moderatorIds = [];
  mods.forEach(function(mod){
    moderatorIds.push(mod._id);
  });
  if (parentBoard) { // If subBoardCount is even rand num between 1-5 subboards, else no subboards
    var subBoardCount = Charlatan.Helpers.rand(6, 0);
    var randNum = Charlatan.Helpers.rand(10, 0);
    subBoardCount = randNum > 6 ? subBoardCount : 0;
  }
  var boards = [];
  var i = 0;
  async.whilst(
    function() {
      var loopCount = parentBoard ? subBoardCount : numBoards;
      return i < loopCount;
    },
    function (cb) {
      var randModIds = Charlatan.Helpers.shuffle(moderatorIds);
      var modsSubset = randModIds.slice(0, Charlatan.Helpers.rand(randModIds.length, 0));
      var board = generateBoard(modsSubset, parentBoard);
      db.insert(board, function(err, body) {
        board._id = body.id;
        process.stdout.write('Generating Boards: ' + board._id + '\r');
        if (parentBoard) {
          boards.push(board);
          i++;
          cb(err);
        }
        else {
          seedBoards(users, board, function (err, subBoards) {
            board.subBoards = subBoards; // add subBoards for top level Boards
            boards.push(board);
            i++;
            cb(err);
          });
        }
      });
    },
    function (err) {
      if (err) {
        console.log('Error generating boards.');
      }
      seedBoardsCallback(err, boards, users);
    }
  );
}

function seedPosts(board, users, parentPost, seedPostsCallback) {
  var i = 0;
  var postCount = Charlatan.Helpers.rand(maxPosts, 1);
  async.whilst(
    function() { // generate 1 - maxPosts
      return i < postCount;
    },
    function (cb) {
      var authorId = Charlatan.Helpers.sample(users)._id;
      var post;
      if (parentPost) { // sub level post
        post = generatePost(authorId, null, parentPost.timestamps.created, parentPost._id);
      }
      else { // top level post
        post = generatePost(authorId, board._id, board.timestamps.created);
      }
      db.insert(post, function(err, body) {
        post._id = body.id;
        process.stdout.write('Generating Post: ' + post._id + '\r');
        if (parentPost) {
          i++;
          cb(err);
        }
        else {
          i++;
          seedPosts(null, users, post, cb);
        }
      });
    },
    function (err) {
      if (err) {
        console.log('Error generating posts.');
      }
      seedPostsCallback(err);
    }
  );
}

function seedTopLevelPosts(boards, users, seedTopLevelPostsCallback) {
  var i = 0;
  async.whilst(
    function() {
      return i < boards.length;
    },
    function (cb) {
      var board = boards[i];
      seedPosts(board, users, null, function(err) { // generate x top level posts per board
        if (board.subBoards && board.subBoards.length > 0) {
          i++;
          seedTopLevelPosts(board.subBoards, users, cb);
        }
        else {
          i++;
          cb(err);
        }
      });
    },
    function (err) {
      if (err) {
        console.log('Error generating posts.');
      }
      seedTopLevelPostsCallback(err);
    }
  );
}

seed.seed = function() {
  async.waterfall([
      function(cb) {
        console.log('Seeding users.');
        seedUsers(cb);
      },
      function(users, cb) {
        console.log('\nSeeding boards.');
        seedBoards(users, null, cb);
      },
      function(boards, users, cb) {
        console.log('\nSeeding posts.');
        seedTopLevelPosts(boards, users, cb);
      }
    ],
    function (err) {
      if (err) {
        console.log(err);
      }
      else {
        console.log('\nDatabase seed complete.');
      }
    }
  );
};

