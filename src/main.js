import child_process from "child_process"
import path          from "path"
import fs            from "fs"
import chalk         from "chalk"
import FileToCopy    from "./FileToCopy"
import FileCopyResult from "./FileCopyResult"
import Logger        from "./Logger"
import Config        from "./Config"

export default class Main {

  run() {
    const config = Config.load(process.env)

    this._mkdir_p(config.webpack_input_path)
    this._create_derived_site_data(config.input_path, config.webpack_input_path)
    this._copy_files(config.input_path, config.webpack_input_path)
  }

  _create_derived_site_data(from_dir, to_dir) {

    const derived_data = { pages: [] }

    this._recurse_all_files(from_dir, to_dir, (file_to_copy) => {
      Logger.log(`_recurse_all_files(${from_dir}, ${to_dir}, ())`)
      const result = new FileCopyResult("derive site data", file_to_copy)
      Logger.log(file_to_copy)
      if (file_to_copy.is_html()) {
        Logger.log("It's HTML!")
        const metadata = file_to_copy.metadata()
        Logger.log(`It has metadata: ${JSON.stringify(metadata)}`)
        derived_data.pages.push(metadata)
      }
      else {
        Logger.log("It's NOT HTML!")
        result.set_action("ignoring", "not an HTML file")
      }
      Logger.log(result.toString());
      return result;
    });
    Logger.log(derived_data)

    const contents = `
// This is derived - do not edit
export default ${JSON.stringify(derived_data,null, '  ')}`
    fs.writeFileSync(path.join(from_dir, "derived_site_data.js"), contents)
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

  _recurse_all_files(from_dir, to_dir, f) {
    Logger.log(chalk`Copying files from '{cyan ${from_dir}}' to '{yellow ${to_dir}}'`)
    const files = fs.readdirSync(from_dir)

    files.forEach( (file) => {
      const file_to_copy = FileToCopy.for_file(file, from_dir, to_dir)

      const result = f(file_to_copy)

      if (file_to_copy.is_directory()) {
        Logger.log(`${file_to_copy.path_to_source_file} is a directory (${file_to_copy.class_name()})`)
        this._recurse_all_files(
          file_to_copy.path_to_source_file,
          file_to_copy.path_to_destination_file,
          f
        )
      }
    })
  }

  _copy_files(from_dir, to_dir) {
    this._recurse_all_files(from_dir, to_dir, (file_to_copy) => {
      return file_to_copy.ensure_destination()
    });
  }
}
