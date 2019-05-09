var Joi = require('joi');
var Boom = require('boom');
var Promise = require('bluebird');

module.exports = {
  validateRoles: function(validations, payload) {
   var schema = Joi.object().keys({
     priorityRestrictions: Joi.array().items(Joi.number()),
     adminAccess: Joi.object().keys({
       settings: Joi.object().keys({
         general: Joi.boolean(),
         advanced: Joi.boolean(),
         legal: Joi.boolean(),
         theme: Joi.boolean()
       }),
       management: Joi.object().keys({
         boards: Joi.boolean(),
         users: Joi.boolean(),
         roles: Joi.boolean(),
         bannedAddresses: Joi.boolean(),
         invitations: Joi.boolean()
       })
     }),
     modAccess: Joi.object().keys({
       users: Joi.boolean(),
       posts: Joi.boolean(),
       messages: Joi.boolean(),
       boardBans: Joi.boolean(),
       logs: Joi.boolean()
     }),
     adminBoards: Joi.object().keys({
       categories: Joi.boolean(),
       boards: Joi.boolean(),
       moveBoards: Joi.boolean(),
       updateCategories: Joi.boolean()
     }),
     adminModerationLogs: Joi.object().keys({
       page: Joi.boolean()
     }),
     adminSettings: Joi.object().keys({
       find: Joi.boolean(),
       update: Joi.boolean(),
       getTheme: Joi.boolean(),
       setTheme: Joi.boolean(),
       resetTheme: Joi.boolean(),
       previewTheme: Joi.boolean(),
       getBlacklist: Joi.boolean(),
       addToBlacklist: Joi.boolean(),
       updateBlacklist: Joi.boolean(),
       deleteFromBlacklist: Joi.boolean()
     }),
     adminLegal: Joi.object().keys({
       text: Joi.boolean(),
       update: Joi.boolean(),
       reset: Joi.boolean()
     }),
     adminUsers: Joi.object().keys({
       privilegedUpdate: Joi.object().keys({
         samePriority: Joi.boolean(),
         lowerPriority: Joi.boolean()
       }),
       privilegedAddRoles: Joi.object().keys({
         samePriority: Joi.boolean(),
         lowerPriority: Joi.boolean()
       }),
       privilegedRemoveRoles: Joi.object().keys({
         samePriority: Joi.boolean(),
         lowerPriority: Joi.boolean()
       }),
       update: Joi.boolean(),
       find: Joi.boolean(),
       addRoles: Joi.boolean(),
       removeRoles: Joi.boolean(),
       searchUsernames: Joi.boolean(),
       count: Joi.boolean(),
       countAdmins: Joi.boolean(),
       countModerators: Joi.boolean(),
       page: Joi.boolean(),
       pageAdmins: Joi.boolean(),
       pageModerators: Joi.boolean(),
       resetPassword: Joi.boolean()
     }),
     adminModerators: Joi.object().keys({
       add: Joi.boolean(),
       remove: Joi.boolean()
     }),
     bans: Joi.object().keys({
       privilegedBan: Joi.object().keys({
         samePriority: Joi.boolean(),
         lowerPriority: Joi.boolean()
       }),
       privilegedBanFromBoards: Joi.object().keys({
         samePriority: Joi.boolean(),
         lowerPriority: Joi.boolean(),
         some: Joi.boolean(),
         all: Joi.boolean()
       }),
       ban: Joi.boolean(),
       unban: Joi.boolean(),
       banFromBoards: Joi.boolean(),
       unbanFromBoards: Joi.boolean(),
       getBannedBoards: Joi.boolean(),
       byBannedBoards: Joi.boolean(),
       addAddresses: Joi.boolean(),
       editAddress: Joi.boolean(),
       deleteAddress: Joi.boolean(),
       pageBannedAddresses: Joi.boolean()
     }),
     userNotes: Joi.object().keys({
       page: Joi.boolean(),
       create: Joi.boolean(),
       update: Joi.boolean(),
       delete: Joi.boolean()
     }),
     roles: validations.roles,
     boards: validations.boards,
     categories: validations.categories,
     conversations: validations.conversations,
     messages: validations.messages,
     threads: validations.threads,
     posts: validations.posts,
     users: validations.users,
     reports: validations.reports,
     watchlist: validations.watchlist,
     mentions: validations.mentions,
     motd: validations.motd,
     rank: validations.rank,
     autoModeration: validations.autoModeration,
     ads: validations.ads,
     userTrust: validations.userTrust,
     portal: validations.portal,
     limits: Joi.array().items({
       path: Joi.string().required(),
       method: Joi.string().valid('GET', 'PUT', 'POST', 'DELETE').required(),
       interval: Joi.number().min(-1).required(),
       maxInInterval: Joi.number().min(1).required(),
       minDifference: Joi.number().min(1).optional()
     }).sparse(),
     notifications: Joi.object().keys({
       dismiss: Joi.boolean(),
       counts: Joi.boolean()
     }),
   }).required();

    var promise = new Promise(function(resolve, reject) {
     if (payload.permissions) {
       Joi.validate(payload.permissions, schema, { stripUnknown: true }, function(err, value) {
         if (err) { return reject(Boom.badRequest(err)); }
         else {
           payload.permissions = value;
           return resolve();
         }
       });
     }
     else { return resolve(); }
   });

    return promise;
 }
};
