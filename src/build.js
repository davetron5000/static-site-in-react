const child_process = require("child_process")
const process = require("process")
const path = require("path")
const fs = require("fs")

const log = (message) => {
  const annotated_message = `[static-site-in-react](${path.basename(__filename)}): ${message}`
  console.log(annotated_message)
}


const read_config = (env) => {
  const env_name = env.BUILD_ENV || "dev"

  log(`environment: ${env_name}`)
  const config_filename = `site-config.${env_name}.json`
  log(`config: ${config_filename}`)
  const config_contents = fs.readFileSync(config_filename)
  const config = JSON.parse(config_contents)
  if (config.root) {
    const root = path.resolve(path.join(path.dirname(config_filename), config.root))
    log(`config.root specified as "${config.root}", resolved to "${root}"`)
    config.root = root;
  }
  else {
    config.root = path.resolve(path.join(__dirname,".."))
    log(`config.root not specified, using "${config.root}"`)
  }

  const output_dir = config.output_dir || `deploy_to_${env.BUILD_ENV || "dev"}`
  config.output_path = path.join(config.root, output_dir)

  log(`site output dir resolved to "${config.output_path}"`)

  config.input_path = path.join(config.root, "site")
  log(`site input dir resolved to "${config.input_path}"`)

  return config
}

config = read_config(process.env)

if (fs.existsSync(config.output_path)) {
  log(`directory "${config.output_path}" already exists`)
}
else {
  log(`creating directory "${config.output_path}"`)
  fs.mkdirSync(config.output_path)
}

copy_files = (from_dir, to_dir) => {
  log(`Copying files from ${from_dir} to ${to_dir}`)

  const files = fs.readdirSync(from_dir)

  files.forEach( (file) => {

    const full_path_to_file = path.join(from_dir, file)
    const is_directory = fs.lstatSync(full_path_to_file).isDirectory()

    if (is_directory) {
      const full_path_to_to_dir = path.join(to_dir, file)
      log(`${file} (in ${from_dir}) is a directory`)

      if (fs.existsSync(full_path_to_to_dir)) {
        log(`path "${full_path_to_to_dir}" already exists`)
      }
      else {
        log(`path "${full_path_to_to_dir}" does not exist. Creating it...`)
        fs.mkdirSync(full_path_to_to_dir)
      }

      copy_files(
        full_path_to_file,
        full_path_to_to_dir
      )
    }
    else {
      const full_path_to_to_file = path.join(to_dir, file)
      log(`${file} (in ${from_dir}) is a file`)
      fs.copyFileSync(full_path_to_file, full_path_to_to_file)
    }
  })
}

copy_files(config.input_path, config.output_path)
