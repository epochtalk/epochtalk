var Joi = require('@hapi/joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {PUT} /users/:id Update
  * @apiName UpdateUser
  * @apiPermission User (Users may update their own account)
  * @apiDescription Used to update user information such as profile fields, or passwords.
  *
  * @apiParam {string} id The user's unique id
  * @apiParam (Payload) {string} [username] The user's username
  * @apiParam (Payload) {string} [email] The user's email
  * @apiParam (Payload) {string} [email_password] The user's password used for updating email
  * @apiParam (Payload) {string} [old_password] The user's old password (used for changing password)
  * @apiParam (Payload) {string} [password] The user's new passowrd (used for changing password)
  * @apiParam (Payload) {string} [confirmation] The user's new password confirmation (used for changing password)
  * @apiParam (Payload) {string} [name] The user's name
  * @apiParam (Payload) {string} [website] URL to user's website
  * @apiParam (Payload) {string} [btc_address] User's bitcoin wallet address
  * @apiParam (Payload) {string} [gender] The user's gender
  * @apiParam (Payload) {date} [dob] Date version of the user's dob
  * @apiParam (Payload) {string} [location] The user's geographical location
  * @apiParam (Payload) {string} [language] The user's native language
  * @apiParam (Payload) {string} [position] The user's position title
  * @apiParam (Payload) {string} [raw_signature] The user's signature as it was entered in the editor by the user
  * @apiParam (Payload) {string} [signature] The user's signature with any markup tags converted and parsed into html elements
  * @apiParam (Payload) {string} [avatar] URL to the user's avatar
  * @apiParam (Payload) {string} [timezone_offset] Preference for UTC offset for date display
  * @apiParam (Payload) {boolean} [patroller_view] Preference to display patroller view
  * @apiParam (Payload) {numbers} [posts_per_page] Preference for how many post to view per page
  * @apiParam (Payload) {numbers} [threads_per_page] Preference for how many threads to view per page
  * @apiParam (Payload) {string[]} [collapsed_categories] Array of category id's which the user has collapsed
  * @apiParam (Payload) {string[]} [ignored_boards] Array of board id's which the user has ignored
  *
  * @apiSuccess {string} id The user's unique id
  * @apiSuccess {string} [username] The user's username
  * @apiSuccess {string} [email] The user's email
  * @apiSuccess {string} [name] The user's name
  * @apiSuccess {string} [website] URL to user's website
  * @apiSuccess {string} [btc_address] User's bitcoin wallet address
  * @apiSuccess {string} [gender] The user's gender
  * @apiSuccess {timestamp} [dob] Timestamp of the user's dob
  * @apiSuccess {string} [location] The user's geographical location
  * @apiSuccess {string} [language] The user's native language
  * @apiSuccess {string} [position] The user's position title
  * @apiSuccess {string} [raw_signature] The user's signature as it was entered in the editor by the user
  * @apiSuccess {string} [signature] The user's signature with any markup tags converted and parsed into html elements
  * @apiSuccess {string} [avatar] URL to the user's avatar
  * @apiSuccess {string[]} collapsed_categories Array containing id of categories the user collapsed
  * @apiSuccess {string[]} ignored_boards Array containing id of boards the user ignores
  * @apiSuccess {string} timezone_offset Preference indicating UTC offset for date display
  * @apiSuccess {number} posts_per_page Preference indicating the number of posts the user wants to view per page
  * @apiSuccess {number} threads_per_page Preference indicating the number of threads the user wants to view per page
  *
  * @apiError (Error 400) BadRequest Occurs when resetting password and an invalid old password is provided
  * @apiError (Error 500) InternalServerError There was an error updating the user
  */
module.exports = {
  method: 'PUT',
  path: '/api/users/{id}',
  options: {
    auth: { strategy: 'jwt' },
    plugins: {
      mod_log: {
        type: 'users.update',
        diffUser: 'params.id',
        data: {
          id: 'params.id',
          email: 'payload.email',
          username: 'payload.username',
          name: 'payload.name',
          website: 'payload.website',
          btc_address: 'payload.btc_address',
          gender: 'payload.gender',
          dob: 'payload.dob',
          location: 'payload.location',
          language: 'payload.language',
          position: 'payload.position',
          raw_signature: 'payload.raw_signature',
          signature: 'payload.signature',
          avatar: 'payload.avatar',
        }
      }
    },
    validate: {
      params: Joi.object({ id: Joi.string().required() }),
      payload: Joi.object({
        email: Joi.string().email(),
        email_password: Joi.string().min(8).max(255),
        username: Joi.string().regex(/^[a-zA-Z\d-_.]+$/).min(3).max(255).required(),
        old_password: Joi.string().min(8).max(255),
        password: Joi.string().min(8).max(255),
        confirmation: Joi.ref('password'),
        name: Joi.string().max(255).allow(''),
        website: Joi.string().regex(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/).allow(''),
        btc_address: Joi.string().max(255).allow(''),
        gender: Joi.string().max(255).allow(''),
        dob: Joi.date().allow('', null),
        location: Joi.string().max(255).allow(''),
        language: Joi.string().max(255).allow(''),
        position: Joi.string().max(255).allow(''),
        raw_signature: Joi.string().max(5000).allow(''),
        signature: Joi.string().max(5000).allow(''),
        avatar: Joi.string().allow(''),
        timezone_offset: Joi.string().allow(''),
        patroller_view: Joi.boolean().default(false),
        posts_per_page: Joi.number().min(10).max(100).default(25),
        threads_per_page: Joi.number().min(10).max(100).default(25),
        collapsed_categories: Joi.array().items(Joi.string()),
        ignored_boards: Joi.array().items(Joi.string())
      })
      .and('password', 'old_password', 'confirmation')
      .with('signature', 'raw_signature')
      .with('email', 'email_password')
    },
    pre: [
      { method: (request) => request.server.methods.auth.users.update(request.server, request.auth, request.params.id, request.payload) },
      { method: (request) => request.server.methods.common.users.clean(request.sanitizer, request.payload) },
      { method: (request) => request.server.methods.common.users.parse(request.parser, request.payload) },
      { method: (request) => request.server.methods.common.images.signature(request.imageStore, request.payload) },
      { method: (request) => request.server.methods.common.images.avatarSub(request.payload) }
    ]
  },
  handler: function(request) {
    // update the user in db
    request.payload.id = request.params.id;
    var promise = request.db.users.update(request.payload)
    .then(function(user) {
      delete user.confirmation_token;
      delete user.reset_token;
      delete user.reset_expiration;
      delete user.old_password;
      delete user.password;
      delete user.confirmation;
      delete user.email_password;
      return user;
    })
    .then(function(user) {
      return request.session.updateUserInfo(user)
      .then(function() { return user; });
    })
    .error(request.errorMap.toHttpError);

    return promise;
  }
};
