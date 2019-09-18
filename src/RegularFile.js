import fs from "fs"
import path from "path"
import FileCopyResult from "./FileCopyResult"
import Logger from "./Logger"

export default class RegularFile {
  constructor(file_name, source_path, destination_path) {
    this.path_to_source_file = path.join(source_path, file_name)
    this.path_to_destination_file = path.join(destination_path, file_name)

    const a = source_path.split(/\//).reverse()
    const b = destination_path.split(/\//).reverse()
    const c = []
    let done = false;
    b.forEach( (element, index) => {
      if (!done) {
        if (a[index] === b[index]) {
          c.push(element)
        }
        else {
          done = true;
        }
      }
    });
    this.relative_url = ("/" + c.reverse().join("/") + "/" + file_name).replace(/^\/\//,"/").replace(/\.html(\.[^\.]+)?$/,".html")
    this.title = this.relative_url.split(/\//).filter( (part) => {
      return part.length > 0
    }).map( (part) => {
      return part[0].toUpperCase() + part.slice(1)
    }).join(" ").replace(/\.html$/,"")
  }

  is_html() {
    return this.path_to_source_file.match(/\.html$/)
  }

  is_directory() {
    return fs.lstatSync(this.path_to_source_file).isDirectory()
  }

  class_name() { return "RegularFile" }

  metadata() {
    return {
      title: this.title,
      relative_url: this.relative_url
    }
  }

  ensure_destination() {
    const result = new FileCopyResult("copy to webpack", this)

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
