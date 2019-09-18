import path from "path"
import fs from "fs"
import Logger from "./Logger"

export default class Config {

  static load(env) {
    const config = new Config(env)

    const MISSING_PROPERTY_HANDLER = {
      get: function(target,prop,receiver) {
        if (typeof target[prop] === "undefined") {
          throw `config has no property ${prop}`;
        }
        else {
          return Reflect.get(target,prop,receiver)
        }
      }
    }

    // Give a better error message if we try to access properties we don't know about
    return new Proxy(config, MISSING_PROPERTY_HANDLER)
  }

  constructor(unix_env) {
    this.env      = Logger.log_and_return_value(unix_env.BUILD_ENV || "dev", "build env: %s")
    this.filename = Logger.log_and_return_value(`site-config.${this.env}.json`, "config filename: %s")

    this.parsed_config = this._read_config_file()

    this._derive_properties()

  }

  _read_config_file() {

    const config_json = fs.readFileSync(this.filename)
    const parsed_config = JSON.parse(config_json)

    Logger.log(`Parsed ${this.filename} as:\n${ JSON.stringify(parsed_config, null, '  ') }`)

    return parsed_config
  }

  _derive_properties() {
    Object.getOwnPropertyNames(PROPERTY_DERIVERS).forEach( (property) => {
      const deriver = PROPERTY_DERIVERS[property];
      this[property] = Logger.log_and_return_value(
        deriver(this.parsed_config,this),
        `${property} derived as '%s'`)
    })
  }
}

const PROPERTY_DERIVERS = {
  root: (parsed_config_file, config) => {
    if (parsed_config_file.root) {
      return path.resolve(path.join(path.dirname(config.filename), parsed_config_file.root.value))
    }
    else {
      return path.resolve(path.join(__dirname,".."))
    }
  },
  output_path: (_, config) => {
    const output_dir = Logger.log_and_return_value(
      `deploy_to_${config.env}`,
      "output_dir is '%s'")

    return path.join(config.root, output_dir)
  },
  webpack_input_path: (_, config) => {
    const webpack_input_dir = Logger.log_and_return_value(
      `webpack_input_${config.env}`,
      "webpack_input_dir is '%s'")

    return path.join(config.root, webpack_input_dir)
  },
  input_path: (_, config) => {
    return path.join(config.root, "site")
  },
  minify: (parsed_config_file, config) => {
    if (parsed_config_file.minify) {
      return !!parsed_config_file.minify.value
    }
    else {
      Logger.log("'minify' omitted from config file. Defaulting to false")
      return false
    }
  },
  hash: (parsed_config_file, config) => {
    if (parsed_config_file.hash) {
      return !!parsed_config_file.hash.value
    }
    else {
      Logger.log("'hash' omitted from config file. Defaulting to false")
      return false
    }
  }
}
