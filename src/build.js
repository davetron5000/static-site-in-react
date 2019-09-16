const child_process = require("child_process")
const process = require("process")
const path = require("path")
const fs = require("fs")
const { sprintf } = require("sprintf-js")
const chalk = require("chalk")

const log = (message) => {
  const annotated_message = sprintf("[%s](%s): %s",
    chalk.blue.dim("static-site-in-react"),
    chalk.yellow.dim(path.basename(__filename)),
    chalk.white.bold(message))
  console.log(annotated_message)
}

const log_and_return_value = (value, message_string) => {
  log(sprintf(message_string, chalk.greenBright(value)))
  return value
}

const read_config = (env) => {
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

config = read_config(process.env)

if (fs.existsSync(config.output_path)) {
  log(`directory "${config.output_path}" already exists`)
}
else {
  log(`creating directory '${config.output_path}'`)
  fs.mkdirSync(config.output_path)
}

copy_files = (from_dir, to_dir) => {
  log(chalk`Copying files from '{cyan ${from_dir}}' to '{yellow ${to_dir}}'`)

  const files = fs.readdirSync(from_dir)

  files.forEach( (file) => {

    const full_path_to_file = path.join(from_dir, file)
    const is_directory = fs.lstatSync(full_path_to_file).isDirectory()

    if (is_directory) {
      const full_path_to_to_dir = path.join(to_dir, file)
      log(chalk`'{cyan ${file}}' (in '{cyan ${from_dir}}') is a directory`)

      if (fs.existsSync(full_path_to_to_dir)) {
        log(chalk`path '{yellow ${full_path_to_to_dir}}' already exists`)
      }
      else {
        log(chalk`path '{yellow ${full_path_to_to_dir}}' does not exist. Creating it...`)
        fs.mkdirSync(full_path_to_to_dir)
      }

      copy_files(
        full_path_to_file,
        full_path_to_to_dir
      )
    }
    else {
      const full_path_to_to_file = path.join(to_dir, file)
      log(chalk`'{cyan ${file}}' (in '{cyan ${from_dir}}') is a file`)
      fs.copyFileSync(full_path_to_file, full_path_to_to_file)
    }
  })
}

copy_files(config.input_path, config.output_path)
