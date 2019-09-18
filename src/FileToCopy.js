import fs from "fs"
import path from "path"
import chalk from "chalk"
import Logger from "./Logger"
import ReactTemplateFile from "./ReactTemplateFile"
import MarkdownTemplateFile from "./MarkdownTemplateFile"
import FileCopyResult from "./FileCopyResult"
import RegularFile from "./RegularFile"

class NoOp {
  constructor(file_name, source_path, destination_path, reason) {
    this.file_name = file_name;
    this.path_to_source_file = path.join(source_path, file_name)
    this.path_to_destination_file = path.join(destination_path, file_name)
    this.reason = reason
  }
  ensure_destination() { 
    const result = new FileCopyResult("copy to webpack", this)

    result.set_action("ignoring", this.reason)
    Logger.log(result.toString())

    return result
  }
  is_html() { return false }
  metadata() {
    return {};
  }
  is_directory() {
    return fs.lstatSync(this.path_to_source_file).isDirectory()
  }
  class_name() { return "NoOp" }
}

export default class FileToCopy {
  static for_file(file_name, source_path, destination_path) {
    if (file_name.match(/\.html\.jsx$/i)) {
      return new ReactTemplateFile(file_name, source_path, destination_path)
    }
    if (file_name.match(/\.html\.md$/i)) {
      return new MarkdownTemplateFile(file_name, source_path, destination_path)
    }
    if (file_name.match(/\.md\.jsx$/i)) {
      return new NoOp(file_name, source_path, destination_path, 
        `${file_name} appears to be a tmp file`);
    }
    return new RegularFile(file_name, source_path, destination_path)
  }
}
