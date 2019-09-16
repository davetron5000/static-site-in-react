const path = require("path")
const fs = require("fs")
const { log_and_return_value } = require("./log")
const load_config = (env) => {
  const config = {}

  const env_name = log_and_return_value(env.BUILD_ENV || "dev", "envrionment: '%s'")
  const config_filename = log_and_return_value(`site-config.${env_name}.json`,"config file: '%s'")

  const config_json = fs.readFileSync(config_filename)
  const parsed_config = JSON.parse(config_json)
  if (parsed_config.root) {
    config.root = log_and_return_value(
      path.resolve(path.join(path.dirname(config_filename), parsed_config.root.value)),
      `$root specified as '${parsed_config.root.value}', resolved to '%s'`)
  }
  else {
    config.root = log_and_return_value(
      path.resolve(path.join(__dirname,"..")),
      "$root not specified, using '%s'")
  }

  const output_dir = log_and_return_value(
    `deploy_to_${env.BUILD_ENV || "dev"}`,
    "$output_dir is '%s")

  config.output_path = log_and_return_value(
    path.join(config.root, output_dir),
    "config.output_dir resolved to '%s'")

  config.input_path = log_and_return_value(
    path.join(config.root, "site"),
    "config.input_dir resolved to '%s'")

  return config
}

module.exports = {
  load_config: load_config
}
