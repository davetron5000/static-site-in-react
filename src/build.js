const child_process = require("child_process")
const process = require("process")
const path = require("path")
const fs = require("fs")
const chalk = require("chalk")
const { log } = require("./log")
const { load_config } = require("./config_file")

const config = load_config(process.env)

const mkdir_p = (path) => {
  if (fs.existsSync(path)) {
    log(`directory "${path}" already exists`)
  }
  else {
    log(`creating directory '${path}'`)
    fs.mkdirSync(path)
  }
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

mkdir_p(config.webpack_input_path)
copy_files(config.input_path, config.webpack_input_path)
