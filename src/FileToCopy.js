import fs from "fs"
import path from "path"
import chalk from "chalk"
import Logger from "./Logger"
import ReactTemplateFile from "./ReactTemplateFile"
import FileCopyResult from "./FileCopyResult"

export default class FileToCopy {
  static for_file(file_name, source_path, destination_path) {
    if (file_name.match(/\.html\.jsx$/i)) {
      return new ReactTemplateFile(file_name, source_path, destination_path)
    }
    else {
      return new FileToCopy(file_name, source_path, destination_path)
    }
  }

  constructor(file_name, source_path, destination_path) {
    this.path_to_source_file = path.join(source_path, file_name)
    this.path_to_destination_file = path.join(destination_path, file_name)
  }

  ensure_destination() {
    const result = new FileCopyResult(this)

    const source_stat = fs.lstatSync(this.path_to_source_file)

    result.source_modified_at(source_stat.mtimeMs)

    if (source_stat.isDirectory()) {
      result.source_is_directory(true)
      if (fs.existsSync(this.path_to_destination_file)) {
        result.set_action("none", "destination exists")
      }
      else {
        result.set_action("created destination directory", "destination did not exist")
        fs.mkdirSync(this.path_to_destination_file)
      }
    }
    else {
      result.source_is_file(true)
      if (fs.existsSync(this.path_to_destination_file)) {
        const dest_stat = fs.lstatSync(this.path_to_destination_file)
        result.destination_modified_at(dest_stat.mtimeMs)

        if (dest_stat.mtimeMs >= source_stat.mtimeMs) {
          result.set_action("none", "destination fresher than source")
        }
        else {
          result.set_action("copied file", "destination is stale")
          fs.copyFileSync(this.path_to_source_file, this.path_to_destination_file)
        }
      }
      else {
        result.set_action("copied file", "destination doesn't exist")
        fs.copyFileSync(this.path_to_source_file, this.path_to_destination_file)
      }
    }
    Logger.log(result.toString())
    return result
  }
}
