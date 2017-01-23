var compiler;
var renderer;

function parse(input) {
  if (!input) { input = ''; }
  // preserve whitespacing
  input = input.replace(/\r\n|\r|\n/g, String.fromCharCode(26));
  // compile markdown
  input = compiler(input, { renderer: renderer });
  // replace whitespacing
  input = input.replace(new RegExp(String.fromCharCode(26), 'g'), '\n');
  return input;
}

module.exports = function(localCompiler, localRenderer) {
  compiler = localCompiler;
  renderer = localRenderer;
  return { parse: parse };
};
