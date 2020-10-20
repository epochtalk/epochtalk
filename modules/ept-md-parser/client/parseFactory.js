var compiler;
var renderer;

function parse(input) {
  if (!input) { input = ''; }
  // preserve typed in decimal code
  input = input.replace(/(?:&#92;)/gi, '&#92-preserve;');
  // escape back slashes before parsing markdown
  input = input.replace(/\\/g, '&#92;');
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
  // preserve whitespacing (i'm sorry this is hacky, it's needed to preserve newlines after going through the markdown parser)
  input = input.replace(/\r\n|\r|\n/g, "\n\n$ept-newline$\n\n");

  // compile markdown
  input = compiler(input, { renderer: renderer });

  // Fix issue with parser turning ``` into <pre><code> instead of just <code>
  input = input.replace(/<pre><code>/gi, '<code>').replace(/<\/code><\/pre>/gi, '</code>');

  input = input.replace(/(?:&#38;#92-preserve;)/g, '&amp;#92; ')
  input = input.replace(/(?:&#38;#92;)/g, '\\');
  input = input.replace(/(?:&amp;#38;)/g, '&amp;');

  // replace whitespacing
  input = input.replace(/(?:\n\n\$ept-newline\$\n\n)/g, '\r');
  input = input.replace(/(?:\$ept-newline\$)/g, '\r');

  // allow single new line in list items
  var liRegex = /<li>([\s\S]*?)<\/li>/gi;
  var liMatches = input.match(liRegex);
  if (liMatches) {
    liMatches.forEach(function(val) {
      var updatedVal = val.replace(/\n\n/g, '<br/>');
      input = input.replace(val, updatedVal);
    });
  }

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
