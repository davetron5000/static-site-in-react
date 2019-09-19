import fs from "fs"
import path from "path"
import chalk from "chalk"
import Logger from "./Logger"
import ReactTemplateFile from "./ReactTemplateFile"
import MarkdownTemplateFile from "./MarkdownTemplateFile"
import FileCopyResult from "./FileCopyResult"
import NoOpFileCopy from "./NoOpFileCopy"
import RegularFile from "./RegularFile"

export default class FileToCopy {
  static for_file(file_name, source_path, destination_path) {
    if (file_name.match(/\.html\.jsx$/i)) {
      return new ReactTemplateFile(file_name, source_path, destination_path)
    }
    if (file_name.match(/\.html\.md$/i)) {
      return new MarkdownTemplateFile(file_name, source_path, destination_path)
    }
    if (file_name.match(/\.md\.jsx$/i)) {
      return new NoOpFileCopy(file_name, source_path, destination_path, 
        `${file_name} appears to be a tmp file`);
    }
    return new RegularFile(file_name, source_path, destination_path)
  }
}
