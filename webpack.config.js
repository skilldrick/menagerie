const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './app/App.js',
  output: {
    path: 'dist',
    filename: 'index_bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react', 'stage-0']
        }
      },
      {
        test: /\.mp3$/,
        loader: 'file',
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + '/app/index.html',
      hash: true,
      filename: 'index.html',
      inject: 'body'
    })
  ]
};
