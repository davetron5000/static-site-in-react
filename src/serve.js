require("@babel/register")({
  presets: ["@babel/preset-react"],
  plugins: ["transform-es2015-modules-commonjs"]
});

const process = require("process")
const { load_config } = require("./config_file")
const { log } = require("./log")
const config = load_config(process.env)

const LocalWebServer = require("local-web-server")
log("Now serving http://localhost:9000")
const ws = LocalWebServer.create({
  port: 9000,
  stack: require("local-web-server/lib/default-stack"),
  directory: config.output_path
})
