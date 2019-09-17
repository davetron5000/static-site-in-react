require("@babel/register")({
  presets: ["@babel/preset-react"],
  plugins: ["transform-es2015-modules-commonjs"]
});

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin    = require('copy-webpack-plugin')
const HtmlPlugin           = require("html-webpack-plugin");
const fs                   = require("fs");
const path                 = require("path");
const process              = require("process")
const { load_config }      = require("./config_file")
const { log }              = require ("./log")

const getPluginForPagesInPath = (plugin_config, dir, subdir) => {
  const files = fs.readdirSync(dir);
  if (!subdir) {
    subdir = "";
  }

  return files.map( (file) => {
    const pathToFile = path.join(dir,file);
    const fileIsDirectory = fs.lstatSync(pathToFile).isDirectory();

    if (fileIsDirectory) {
      const newSubdir = path.join(subdir, path.basename(pathToFile));
      log(`${pathToFile} is a directory; recursing to ${newSubdir}`);
      return getPluginForPagesInPath(plugin_config,pathToFile,newSubdir);
    }
    else {
      if (path.extname(file) === ".html") {
        log(`${pathToFile} is an html file, creating a plugin`)
        const template = pathToFile;
        const destinationFile = path.join(subdir, file);

        log(`Making plugin: ${template} into ${destinationFile}`)

        return new HtmlPlugin(
          Object.assign(
            plugin_config,
            {
              template: template,
              filename: destinationFile
            }
          )
        );
      }
      else {
        log(`Ignoring ${pathToFile}, since it's not an HTML file`)
      }
    }
  }).flat(1).filter( (element) => {
    return element != null
  });
}

module.exports = function(_) {
  const config = load_config(process.env)

  let plugins = []
  const html_plugins = getPluginForPagesInPath({}, config.webpack_input_path)
  const copy_webpack_plugin = new CopyWebpackPlugin(
    [
      { 
        from: config.webpack_input_path,
        to: config.output_path,
        ignore: [
          "*.js",
          "*.css",
          "*.html",
          "components/*"
        ]
      }
    ],
    {
      debug: true
    }
  )
  const css_plugin = new MiniCssExtractPlugin({ filename: "styles.css" })

  plugins = plugins.concat(html_plugins)
  plugins = plugins.concat([ copy_webpack_plugin ])
  plugins = plugins.concat([ css_plugin ])

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
    plugins: plugins,
    context: config.root,
    entry: `${config.webpack_input_path}/js/index.js`,
    mode: 'none',
    output: {
      path: config.output_path
    }
  };
}
