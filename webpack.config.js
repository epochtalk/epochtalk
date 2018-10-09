const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    frontend: './modules/ept-frontend/client/app.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public/js')
  },
  resolve: {
    modules: [
      'node_modules'
    ],
    alias: {
      '@views': path.resolve(__dirname, './src/app/views'),
      jquery: 'jquery/dist/jquery',
      angular: 'angular/angular',
      ngAnimate: 'angular-animate/angular-animate',
      ngResource: 'angular-resource/angular-resource',
      ngSanitize: 'angular-sanitize/angular-sanitize',
      uiRouter: 'angular-ui-router/release/angular-ui-router',
      ngLoadingBar: 'angular-loading-bar',
      nestable: 'nestable/jquery.nestable',
      angularSortable: 'angular-sortable-view/src/angular-sortable-view.min',
      ngTagsInput: 'ng-tags-input/build/ng-tags-input.min'
    }
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'sass-loader'
        }),
        include: /node_modules/
      },
      {
        test: /\.html$/,
        loader: 'html-loader'
      }
    ]
  }
};
