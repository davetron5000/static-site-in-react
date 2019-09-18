import child_process from "child_process"
import path          from "path"
import fs            from "fs"
import chalk         from "chalk"
import FileToCopy    from "./FileToCopy"
import Logger        from "./Logger"
import Config        from "./Config"

export default class Main {

  run() {
    const config = Config.load(process.env)

    this._mkdir_p(config.webpack_input_path)
    this._copy_files(config.input_path, config.webpack_input_path)
  }

  _mkdir_p(path) {
    if (fs.existsSync(path)) {
      Logger.log(`directory "${path}" already exists`)
    }
    else {
      Logger.log(`creating directory '${path}'`)
      fs.mkdirSync(path)
    }
  }

  _copy_files(from_dir, to_dir) {
    Logger.log(chalk`Copying files from '{cyan ${from_dir}}' to '{yellow ${to_dir}}'`)

    const files = fs.readdirSync(from_dir)

    files.forEach( (file) => {
      const file_to_copy = FileToCopy.for_file(file, from_dir, to_dir)

      const result = file_to_copy.ensure_destination()

      if (result.is_directory) {
        this._copy_files(
          file_to_copy.path_to_source_file,
          file_to_copy.path_to_destination_file
        )
      }
    })
  }
}
