const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScssConfigWebpackPlugin = require('scss-config-webpack-plugin');
const TsConfigWebpackPlugin = require('ts-config-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const package = require('./package.json');
const webpack = require('webpack');

module.exports = {
  output: {
    path: path.resolve(__dirname, 'docs')
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: package.name
    }),
    new ScssConfigWebpackPlugin(),
    new TsConfigWebpackPlugin(),
    new CopyPlugin([
      'src/models/*.png'
    ]),
    new webpack.ProvidePlugin({
      THREE: "three"
    })
  ],
};