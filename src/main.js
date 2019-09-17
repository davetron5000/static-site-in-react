import child_process   from "child_process"
import path            from "path"
import fs              from "fs"
import chalk           from "chalk"
import FileToCopy      from "./FileToCopy"
import { log }         from "./log"
import { load_config } from "./config_file"

const main = () => {
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

  const copy_files = (from_dir, to_dir) => {
    log(chalk`Copying files from '{cyan ${from_dir}}' to '{yellow ${to_dir}}'`)

    const files = fs.readdirSync(from_dir)

    files.forEach( (file) => {
      const file_to_copy = FileToCopy.for_file(file, from_dir, to_dir)

      const result = file_to_copy.ensure_destination()

      if (result.is_directory) {
        copy_files(
          file_to_copy.path_to_source_file,
          file_to_copy.path_to_destination_file
        )
      }
    })
  }

  mkdir_p(config.webpack_input_path)
  copy_files(config.input_path, config.webpack_input_path)
}

export default main
