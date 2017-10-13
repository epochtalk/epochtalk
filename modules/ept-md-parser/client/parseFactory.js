var compiler;
var renderer;

function parse(input) {
  if (!input) { input = ''; }
  // compile markdown
  input = compiler(input, { renderer: renderer });
  // preserve whitespacing
  input = input.replace(/\r\n|\r|\n/g, String.fromCharCode(26));
  // replace whitespacing
  input = input.replace(new RegExp(String.fromCharCode(26), 'g'), '\n');
  return input;
}

module.exports = function(localCompiler, localRenderer) {
  compiler = localCompiler;
  renderer = localRenderer;
  return { parse: parse };
};
