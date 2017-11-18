/*jshint esnext:true */
/* globals require, __dirname, module */

const
    path = require('path');


const config = {
  entry: './src/index.js', /* entry point*/
  output: {
    path: path.resolve(__dirname, 'docs'), /* destination path */
    filename: 'tiler.bundle.js' /* entry point*/
  },
  watch : true,
  module : {
    rules : [
    {
      test : /\.js$/,
      include : path.resolve(__dirname, 'src'), /* source folder */
      use : [{
        loader: 'babel-loader',
        options : {
          presets : [

          ]
        }
      }]
    }
    
    
    ]
  }
};

module.exports = config;
