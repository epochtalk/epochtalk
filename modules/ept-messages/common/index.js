var common = {};
module.exports = common;

function messagesClean(sanitizer, payload) {
  payload.body = sanitizer.bbcode(payload.body);
}

function messagesParse(parser, payload) {
  payload.body = parser.parse(payload.body);
}

common.export = () =>  {
  return [
    {
      name: 'common.messages.clean',
      method: messagesClean,
      options: { callback: false }
    },
    {
      name: 'common.messages.parse',
      method: messagesParse,
      options: { callback: false }
    }
  ];
};
