const path = require("path")
const fs = require("fs")
const { log, log_and_return_value } = require("./log")

const load_config = (env) => {
  const config = {}
  config.env = log_and_return_value(env.BUILD_ENV || "dev", "environment: '%s'")
  config.filename = derive_config_filename(config)
  const parsed_config = read_config_file(config.filename)

  Object.getOwnPropertyNames(property_derivers).forEach( (property) => {
    const deriver = property_derivers[property];
    config[property] = deriver(parsed_config,config)
  })

  return new Proxy(config, missing_property_handler)
}

module.exports = {
  load_config: load_config
}

/****************************/

const missing_property_handler = {
  get: function(target,prop,receiver) {
    if (typeof target[prop] === "undefined") {
      throw `config has no property ${prop}`;
    }
    else {
      return Reflect.get(target,prop,receiver)
    }
  }
}

const read_config_file = (config_filename) => {

  const config_json = fs.readFileSync(config_filename)
  const parsed_config = JSON.parse(config_json)

  log(`Parsed ${config_filename} as:\n${ JSON.stringify(parsed_config, null, '  ') }`)

  return parsed_config
}

const derive_config_filename = (config) => {
  return log_and_return_value(`site-config.${config.env}.json`,"config file: '%s'")
}

const property_derivers = {
  root: (parsed_config_file, config) => {
    if (parsed_config_file.root) {
      return log_and_return_value(
        path.resolve(path.join(path.dirname(config.filename), parsed_config_file.root.value)),
        `config.root resolved to '%s'`)
    }
    else {
      return log_and_return_value(
        path.resolve(path.join(__dirname,"..")),
        "config.root omitted, defaultng to '%s'")
    }
  },
  output_path: (_, config) => {
    const output_dir = log_and_return_value(
      `deploy_to_${config.env}`,
      "$output_dir is '%s")

    return log_and_return_value(
      path.join(config.root, output_dir),
      "config.output_dir resolved to '%s'")
  },
  input_path: (_, config) => {
    return log_and_return_value(
      path.join(config.root, "site"),
      "config.input_dir resolved to '%s'")
  }
}

