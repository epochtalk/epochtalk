var Joi = require('@hapi/joi');
var Boom = require('boom');
var Request = require('request');

/**
  * @api {POST} /login Login
  * @apiName Login
  * @apiGroup Auth
  * @apiVersion 0.4.0
  * @apiDescription Used to log a user into their account.
  *
  * @apiParam (Payload) {string} username User's unique username
  * @apiParam (Payload) {string} password User's password
  *
  * @apiSuccess {string} token User's authentication token
  * @apiSuccess {string} id User's unique id
  * @apiSuccess {string} username The user account username
  * @apiSuccess {string} avatar User's avatar url
  * @apiSuccess {object} permissions Object containing user's permissions
  * @apiSuccess {string[]} moderating Array of user's moderated board ids
  * @apiSuccess {string[]} roles Array of user's roles
  *
  * @apiError (Error 400) BadRequest Invalid credentials were provided or the account hasn't been confirmed
  * @apiError (Error 500) InternalServerError There was an issue logging in
  */
module.exports = {
  method: 'POST',
  path: '/api/auth/google',
  options: {
    auth: { mode: 'try', strategy: 'jwt' },
    validate: {
      payload: Joi.object({
        access_token: Joi.string().required(),
        username: Joi.string(),
        remember_me: Joi.boolean().default(false)
      })
    }
  },
  handler: function(request) {
    var userInfoApi = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json';
    var rememberMe = request.payload.remember_me;
    var userData;
    var promise = new Promise(function(resolve, reject) {
      var headers = { Authorization: 'Bearer ' + request.payload.access_token };
      return Request.get({ url: userInfoApi, headers: headers, json: true }, function(err, response, userInfo) {
        console.log(userInfo);
        userData = userInfo;
        if (err || response.statusCode !== 200) { return reject(Boom.badRequest(error)); }
        else { return resolve(userInfo); }
      });
    })
    .then(function(userInfo) {
      return request.db.users.userByEmail(userInfo.email);
    })
    .then(function(user) {
      // Log user in
      if (user) {
        return request.db.users.userByUsername(user.username)
        .then(function(user) {
          if (user.ban_expiration && user.ban_expiration < new Date()) {
            return request.db.bans.unban(user.id)
            .then(function(unbannedUser) {
              user.roles = unbannedUser.roles; // update user roles
              return user;
            });
          }
          else { return user; }
        })
        // Get Moderated Boards
        .then(function(user) {
          return request.db.moderators.getUsersBoards(user.id)
          .then(function(boards) {
            boards = boards.map(function(board) { return board.board_id; });
            user.moderating = boards;
            return user;
          });
        })
        .then(function(user) {
          if (rememberMe) { user.expiration = undefined; } // forever
          else { user.expiration = 1209600; } // 14 days
          return user;
        })
        // builds token, saves session, returns request output
        .then(request.session.save)
        .error(request.errorMap.toHttpError);
      }
      // Create account
      else {
        var newUser = {
          username: request.payload.username || userData.email,
          email: userData.email,
          password: null
        };
        return request.db.users.create(newUser)
        // set newbie role
        .tap(function(user) {
          var newbieEnabled = request.server.app.config.newbieEnabled;
          if (newbieEnabled) {
            return request.db.users.addRoles([user.username], 'CN0h5ZeBTGqMbzwVdMWahQ');
          }
        })
        // remove invitation if exists in db
        .tap(function(user) { return request.db.invitations.remove(user.email); })
        .then(function(createdUser) {
          createdUser.avatar = userData.picture;
          var ip = request.headers['x-forwarded-for'] || request.info.remoteAddress;
          var opts = { ip: ip, userId: createdUser.id };
          return request.db.bans.getMaliciousScore(opts)
          .then(function(score) {
            // User has a malicious score less than 1 let them register
            if (score < 1) { return createdUser; }
            // User has a malicious score higher than 1 ban the account
            else {
              return request.db.bans.ban(createdUser.id)
              .then(function(banInfo) {
                createdUser.malicious_score = score;
                createdUser.roles = banInfo.roles;
                createdUser.ban_expiration = banInfo.expiration;
                return createdUser;
              });
            }
          })
          .then(function(createdUser) {
            return request.db.users.update({ id: createdUser.id, avatar: userData.picture, name: userData.name })
            .then(function() { return createdUser; })
          })
          .then(request.session.save);
        })
        .error(request.errorMap.toHttpError);
      }
    });

    return promise;
  }
};
