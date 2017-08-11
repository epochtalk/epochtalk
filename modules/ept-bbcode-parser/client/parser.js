var bbcodeCompiler = require('./bbcode');
var bbcodeDumbCompiler = require('./bbcode-dumb');

module.exports = {
  parse: function (input) {
    if (!input) {
      input = '';
    }

    // this basically prevents html tags
    // convert all (<, &lt;) and (>, &gt;) to decimal to escape the regex
    // in the bbcode dumbBBcodeParser that'll unescape those chars
    input = input.replace(/(?:<br \/>)/g, '\n');
    input = input.replace(/(?:<|&lt;)/g, '&#60;');
    input = input.replace(/(?:>|&gt;)/g, '&#62;');

    if (input.indexOf('[') >= 0) {
      // parse input to generate body
      input = bbcodeCompiler.process({text: input}).html;

      // If there are any ['s left we need to parse them
      if (input.indexOf('[') >= 0) {
        input = bbcodeDumbCompiler.process(input);
      }
    }

    return input;
  }
};
