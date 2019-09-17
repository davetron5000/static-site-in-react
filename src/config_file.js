import path from "path"
import fs from "fs"
import { log, log_and_return_value } from "./log"

const load_config = (env) => {
  const config = {}
  config.env = log_and_return_value(env.BUILD_ENV || "dev", "environment: '%s'")
  config.filename = derive_config_filename(config)
  const parsed_config = read_config_file(config.filename)

  Object.getOwnPropertyNames(property_derivers).forEach( (property) => {
    const deriver = property_derivers[property];
    config[property] = log_and_return_value(
      deriver(parsed_config,config),
      `${property} derived as '%s'`)
  })

  return new Proxy(config, missing_property_handler)
}

export {
  load_config
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
      return path.resolve(path.join(path.dirname(config.filename), parsed_config_file.root.value))
    }
    else {
      return path.resolve(path.join(__dirname,".."))
    }
  },
  output_path: (_, config) => {
    const output_dir = log_and_return_value(
      `deploy_to_${config.env}`,
      "output_dir is '%s")

    return path.join(config.root, output_dir)
  },
  webpack_input_path: (_, config) => {
    const webpack_input_dir = log_and_return_value(
      `webpack_input_${config.env}`,
      "webpack_input_dir is '%s")

    return path.join(config.root, webpack_input_dir)
  },
  input_path: (_, config) => {
    return path.join(config.root, "site")
  }
}

