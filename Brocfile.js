var uglifyJavaScript = require('broccoli-uglify-js')
var compileES6 = require('broccoli-es6-concatenator')
var compileSass = require('broccoli-sass')
var pickFiles = require('broccoli-funnel')
var mergeTrees = require('broccoli-merge-trees')
var findBowerTrees = require('broccoli-bower')
var env = require('broccoli-env').getEnv()

// create tree for files in the app folder
var app = 'app'
app = pickFiles(app, {
  srcDir: '/',
  destDir: '/' // move under appkit namespace
})

// create tree for files in the styles folder
var styles = 'app/scss'
styles = pickFiles(styles, {
  srcDir: '/',
  destDir: '/' // move under appkit namespace
})

// include app, styles
var sourceTrees = [styles, app]

// include tests if not in production
if (env !== 'production') {
  // sourceTrees.push(tests)
}

// Add bower dependencies
// findBowerTrees uses heuristics to pick the lib directory and/or main files,
// and returns an array of trees for each bower package found.
sourceTrees = sourceTrees.concat(findBowerTrees())

// merge array into tree
var appAndDependencies = new mergeTrees(sourceTrees, { overwrite: true })

// Transpile ES6 modules and concatenate them,
// recursively including modules referenced by import statements.
var appJs = compileES6(appAndDependencies, {
  // Prepend contents of vendor/loader.js
  inputFiles: [
    '**/*.js'
  ],
  legacyFilesToAppend: [
    'jquery.js'
  ],
  wrapInEval: env !== 'production',
  outputFile: '/assets/app.js'
})

// compile sass
var sassTrees = [styles].concat(findBowerTrees());
var appCss = compileSass(sassTrees, 'app.scss', 'assets/app.css')

if (env === 'production') {
  // minify js
  appJs = uglifyJavaScript(appJs, {
    // mangle: false,
    // compress: false
  })
}

// create tree for public folder (no filters needed here)
var publicFiles = 'public'

// merge js, css and public file trees, and export them
module.exports = mergeTrees([appJs, appCss, publicFiles])
