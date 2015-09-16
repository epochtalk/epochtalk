var path = require('path');
var Boom = require('boom');
var Promise = require('bluebird');
var bbcodeParser = require('epochtalk-bbcode-parser');
var db = require(path.normalize(__dirname + '/../../../db'));
var sanitizer = require(path.normalize(__dirname + '/../../sanitizer'));

module.exports = {
  canCreate: function(request, reply) {
    var userId = request.auth.credentials.id;
    var conversationId = request.payload.conversation_id;

    var promise = isConversationMember(conversationId, userId)
    .then(function(isMember) {
      var result = Boom.badRequest();
      if (isMember) { result = ''; }
      return result;
    });
    return reply(promise);
  },
  canDelete: function(request, reply) {
    // isAdmin or message sender
    var userId = request.auth.credentials.id;
    var messageId = request.params.id;

    // TODO: pull messages.delete from permission matrix
    var isSender = isMessageSender(messageId, userId);

    var promise = Promise.join(isSender, function(sender) {
      var result = Boom.badRequest();
      if (sender) { result = ''; }
      return result;
    });
    return reply(promise);
  },
  clean: function(request, reply) {
    request.payload.body = sanitizer.bbcode(request.payload.body);
    return reply();
  },
  parseEncodings: function(request, reply) {
    var raw_body = request.payload.body;
    // check if raw_body has any bbcode
    if (raw_body.indexOf('[') >= 0) {
      // convert all (<, &lt;) and (>, &gt;) to decimal to escape the regex
      // in the bbcode parser that'll unescape those chars
      raw_body = raw_body.replace(/(?:<|&lt;)/g, '&#60;');
      raw_body = raw_body.replace(/(?:>|&gt;)/g, '&#62;');

      // convert all unicode characters to their numeric representation
      // this is so we can save it to the db and present it to any encoding
      raw_body = textToEntities(raw_body);

      // save back to request.payload.body
      request.payload.body = bbcodeParser.process({text: raw_body}).html;
    }

    return reply();
  }
};

function textToEntities(text) {
  var entities = '';
  for (var i = 0; i < text.length; i++) {
    if (text.charCodeAt(i) > 127) {
      entities += '&#' + text.charCodeAt(i) + ';';
    }
    else { entities += text.charAt(i); }
  }

  return entities;
}

function isConversationMember(conversationId, userId) {
  return db.conversations.isConversationMember(conversationId, userId)
  .then(function(isMember) { return isMember; });
}

function isMessageSender(messageId, userId) {
  return db.messages.isMessageSender(messageId, userId)
  .then(function(isSender) { return isSender; });
}
