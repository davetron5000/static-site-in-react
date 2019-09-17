import fs from "fs"
import path from "path"
import chalk from "chalk"
import { log, log_and_return_value } from "./log"

class Result {
  constructor(file_to_copy) {
    this.source_path = file_to_copy.path_to_source_file
    this.destination_path = file_to_copy.path_to_destination_file
  }

  source_is_directory(is_directory) {
    this.is_directory = is_directory
    this.is_file = !is_directory
  }

  source_is_file(is_file) {
    this.is_directory = !is_file
    this.is_file = is_file
  }

  set_action(action, reason) {
    this.action = action
    this.reason = reason
  }

  source_modified_at(mtimeMs) {
    this.source_mtimeMs = mtimeMs
  }

  destination_modified_at(mtimeMs) {
    this.destination_mtimeMs = mtimeMs
  }

  toString() {
    return chalk`FileToCopy.Result [
  from       : '{green ${this.source_path}}'
    modified : {yellow ${this.source_mtimeMs}}
  to         : '{green ${this.destination_path}}'
${ this.destination_mtimeMs ? chalk`    modified : {yellow ${this.destination_mtimeMs}}` : "" }
  type       : {green ${this.is_file ? 'file' : 'directory' }}
  action     : {cyan ${this.action}}, reason '{yellow ${this.reason}}'
]`
  }
}

export default class FileToCopy {
  constructor(file_name, source_path, destination_path) {
    this.path_to_source_file = path.join(source_path, file_name)
    this.path_to_destination_file = path.join(destination_path, file_name)
  }

  ensure_destination() {
    const result = new Result(this)

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
    log(result.toString())
    return result
  }
}
