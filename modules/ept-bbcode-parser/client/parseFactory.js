var compiler;

function parse(input) {
  if (!input) { input = ''; }

  // this basically prevents html tags
  // convert all (<, &lt;) and (>, &gt;) to decimal to escape the regex
  // in the bbcode parser that'll unescape those chars
  input = input.replace(/(?:<|&lt;)/g, '&#60;');
  input = input.replace(/(?:>|&gt;)/g, '&#62;');

  if (input.indexOf('[') >= 0) {
    // parse input to generate body
    input = compiler.process({text: input}).html;
  }

  return input;
}

module.exports = function(localCompiler) {
  compiler = localCompiler;
  return { parse: parse };
};
