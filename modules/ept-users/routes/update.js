var Joi = require('joi');

/**
  * @apiVersion 0.4.0
  * @apiGroup Users
  * @api {PUT} /users Update
  * @apiName UpdateUser
  * @apiPermission User (Users may update their own account)
  * @apiDescription Used to update user information such as profile fields, or passwords.
  *
  * @apiParam (Payload) {string} id The user's unique id
  * @apiParam (Payload) {string} [username] The user's username
  * @apiParam (Payload) {string} [email] The user's email
  * @apiParam (Payload) {string} [old_password] The user's old password (used for changing password)
  * @apiParam (Payload) {string} [password] The user's new passowrd (used for changing password)
  * @apiParam (Payload) {string} [confirmation] The user's new password confirmation (used for changing password)
  * @apiParam (Payload) {string} [name] The user's name
  * @apiParam (Payload) {string} [website] URL to user's website
  * @apiParam (Payload) {string} [btcAddress] User's bitcoin wallet address
  * @apiParam (Payload) {string} [gender] The user's gender
  * @apiParam (Payload) {date} [dob] Date version of the user's dob
  * @apiParam (Payload) {string} [location] The user's geographical location
  * @apiParam (Payload) {string} [language] The user's native language
  * @apiParam (Payload) {string} [position] The user's position title
  * @apiParam (Payload) {string} [raw_signature] The user's signature as it was entered in the editor by the user
  * @apiParam (Payload) {string} [signature] The user's signature with any markup tags converted and parsed into html elements
  * @apiParam (Payload) {string} [avatar] URL to the user's avatar
  *
  * @apiSuccess {string} id The user's unique id
  * @apiSuccess {string} [username] The user's username
  * @apiSuccess {string} [email] The user's email
  * @apiSuccess {string} [name] The user's name
  * @apiSuccess {string} [website] URL to user's website
  * @apiSuccess {string} [btcAddress] User's bitcoin wallet address
  * @apiSuccess {string} [gender] The user's gender
  * @apiSuccess {timestamp} [dob] Timestamp of the user's dob
  * @apiSuccess {string} [location] The user's geographical location
  * @apiSuccess {string} [language] The user's native language
  * @apiSuccess {string} [position] The user's position title
  * @apiSuccess {string} [raw_signature] The user's signature as it was entered in the editor by the user
  * @apiSuccess {string} [signature] The user's signature with any markup tags converted and parsed into html elements
  * @apiSuccess {string} [avatar] URL to the user's avatar
  *
  * @apiError BadRequest Occurs when resetting password and an invalid old password is provided
  * @apiError (Error 500) InternalServerError There was error updating the user
  */
module.exports = {
  method: 'PUT',
  path: '/api/users/{id}',
  config: {
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
          btcAddress: 'payload.btcAddress',
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
      params: { id: Joi.string().required() },
      payload: Joi.object().keys({
        email: Joi.string().email(),
        emailPassword: Joi.string().min(8).max(255),
        username: Joi.string().regex(/^[a-zA-Z\d-_.]+$/).min(3).max(255).required(),
        old_password: Joi.string().min(8).max(255),
        password: Joi.string().min(8).max(255),
        confirmation: Joi.ref('password'),
        name: Joi.string().max(255).allow(''),
        website: Joi.string().uri({scheme: ['http', 'https']}).allow(''),
        btcAddress: Joi.string().max(255).allow(''),
        gender: Joi.string().max(255).allow(''),
        dob: Joi.date().allow('', null),
        location: Joi.string().max(255).allow(''),
        language: Joi.string().max(255).allow(''),
        position: Joi.string().max(255).allow(''),
        raw_signature: Joi.string().max(5000).allow(''),
        signature: Joi.string().max(5000).allow(''),
        avatar: Joi.string().uri({scheme: ['http', 'https']}).allow(''),
        posts_per_page: Joi.number().min(10).max(100).default(25),
        threads_per_page: Joi.number().min(10).max(100).default(25),
        collapsed_categories: Joi.array().items(Joi.string())
      })
      .and('password', 'old_password', 'confirmation')
      .with('signature', 'raw_signature')
      .with('email', 'emailPassword')
    },
    pre: [
      { method: 'auth.users.update(server, auth, params.id, payload)' },
      { method: 'common.users.clean(sanitizer, payload)' },
      { method: 'common.users.parse(parser, payload)' },
      { method: 'common.images.signature(imageStore, payload)' },
      { method: 'common.images.avatarSub(payload)' }
    ]
  },
  handler: function(request, reply) {
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
      delete user.emailPassword;
      return user;
    })
    .then(function(user) {
      return request.session.updateUserInfo(user)
      .then(function() { return user; });
    });

    return reply(promise);
  }
};
