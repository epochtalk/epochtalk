var compiler;
var renderer;

function parse(input) {
  if (!input) { input = ''; }
  // escape back slashes before parsing markdown
  input = input.replace(/\\/g, '&#92;');
  console.log('MD Before:', input);
  var regex = /\`([\s\S]*?)\`/gi;

  // MD parser replaces &lt with &amp;lt within code tags, change them back to < and >
  // so they parse properly
  var codeMatches = input.match(regex);
  if (codeMatches) {
    codeMatches.forEach(function(val) {
      var updatedVal = val.replace(/(?:&lt;)/gi, '<').replace(/(?:&gt;)/gi, '>');
      input = input.replace(val, updatedVal);
    });
  }

  // Stop html entities from being encoded by replacing & with entity
  input = input.replace(/(?:&)/g, '&#38;');

  // compile markdown
  input = compiler(input, { renderer: renderer });
  input = input.replace(/(?:&amp;#38;)/g, '&amp;');

  // preserve whitespacing
  input = input.replace(/\r\n|\r|\n/g, String.fromCharCode(26));

  // replace whitespacing
  input = input.replace(new RegExp(String.fromCharCode(26), 'g'), '\n');

  // replace &#38;lt and &#38;lt; with < and >
  // Put back lt and gt after they get butchered by the md parser
  input = input.replace(/(?:&#38;lt;)/gi, '&lt;');
  input = input.replace(/(?:&#38;gt;)/gi, '&gt;');

  return input;
}

module.exports = function(localCompiler, localRenderer) {
  compiler = localCompiler;
  renderer = localRenderer;
  return { parse: parse };
};
