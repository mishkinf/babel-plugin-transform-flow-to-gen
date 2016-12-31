const path = require(`path`);
const webpack = require(`webpack`);
const HtmlWebpackPlugin = require(`html-webpack-plugin`);
const plugin = require('../lib');

module.exports = {
  entry: path.join(__dirname, 'src/index.js'),
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.join(__dirname, 'src'),
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.join(__dirname, 'public/index.html')
    })
  ],
  devServer: {
    contentBase: __dirname,
    compress: true,
    port: 3000
  }
};
