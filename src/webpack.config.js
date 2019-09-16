const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin')
const fs                   = require("fs");
const path                 = require("path");
const process = require("process")
const { load_config }      = require("./config_file")

module.exports = function(_) {
  const config = load_config(process.env)

  const copy_webpack_plugin = new CopyWebpackPlugin(
    [
      { 
        from: config.webpack_input_path,
        to: config.output_path,
        ignore: [
          "*.js",
          "*.css"
        ]
      }
    ],
    {
      debug: true
    }
  )

  return {
    module: {
      rules: [
        {
          test: /.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader"
          ]
        }
      ]
    },
    plugins: [
      copy_webpack_plugin,
      new MiniCssExtractPlugin({ filename: "styles.css" })
    ],
    context: config.root,
    entry: `${config.webpack_input_path}/js/index.js`,
    mode: 'none',
    output: {
      path: config.output_path
    }
  };
}
