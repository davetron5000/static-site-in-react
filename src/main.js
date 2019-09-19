import child_process  from "child_process"
import path           from "path"
import fs             from "fs"
import chalk          from "chalk"
import FileToCopy     from "./FileToCopy"
import FileCopyResult from "./FileCopyResult"
import Logger         from "./Logger"
import Config         from "./Config"
import FileRecurser   from "./FileRecurser"
import SiteData       from "./SiteData"

export default class Main {

  constructor() {
    this.file_recurser = new FileRecurser()
  }

  run() {
    const config = Config.load(process.env)

    if (fs.existsSync(config.webpack_input_path)) {
      Logger.log(`directory for webpack_input_path "${config.webpack_input_path}" already exists`)
    }
    else {
      Logger.log(`creating directory for webpack_input_path '${config.webpack_input_path}'`)
      fs.mkdirSync(config.webpack_input_path)
    }

    this._create_derived_site_data(config.input_path, config.webpack_input_path)

    this.file_recurser.recurse(config.input_path, config.webpack_input_path, (file_to_copy) => {
      return file_to_copy.ensure_destination()
    });
  }

  _create_derived_site_data(from_dir, to_dir) {

    const site_data = new SiteData(from_dir, to_dir)
    const derived_data = site_data.get_derived_data()

    const contents = `
// This is derived - do not edit
export default ${JSON.stringify(derived_data,null, '  ')}`
    fs.writeFileSync(path.join(from_dir, "derived_site_data.js"), contents)
  }

}
