import path from "path"
import fs from "fs"
import Logger from "./Logger"
import FileCopyResult from "./FileCopyResult"
import RegularFile from "./RegularFile"

export default class NoOpFileCopy extends RegularFile {
  constructor(file_name, source_path, destination_path, reason) {
    super(file_name, source_path, destination_path)
    this.file_name = file_name;
    this.reason = reason
  }
  ensure_destination() { 
    const result = new FileCopyResult("copy to webpack", this)

    result.set_action("ignoring", this.reason)
    Logger.log(result.toString())

    return result
  }
  class_name() { return "NoOp" }
}

