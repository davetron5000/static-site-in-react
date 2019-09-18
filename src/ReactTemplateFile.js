import fs                            from "fs"
import path                          from "path"
import chalk                         from "chalk"
import React                         from "react";
import ReactDOMServer                from "react-dom/server";
import { log, log_and_return_value } from "./log"
import FileCopyResult                from "./FileCopyResult"

export default class ReactTemplateFile {
  constructor(file_name, source_path, destination_path) {
    if (!file_name.match(/\.html\.jsx$/i)) {
      throw `ReactTemplateFile cannot be used on ${file_name}, as it does not end in .html.jsx`
    }
    this.path_to_source_file = path.join(source_path, file_name)
    this.path_to_destination_file = path.join(destination_path, file_name.replace(/\.jsx$/i,""))
  }

  ensure_destination() {
    const result = new FileCopyResult(this)

    const source_stat = fs.lstatSync(this.path_to_source_file)

    result.source_modified_at(source_stat.mtimeMs)

    result.source_is_file(true)
    result.set_action("rendered file", "always render since we don't know if React components changed yet")

    this._render_file()

    log(result.toString())
    return result
  }

  _render_file() {
    delete require.cache[require.resolve(this.path_to_source_file)]
    const component = require(this.path_to_source_file).default;
    fs.copyFileSync(this.path_to_source_file, this.path_to_destination_file)
    fs.writeFileSync(
      this.path_to_destination_file,
      "<!DOCTYPE html>" +
        ReactDOMServer.renderToStaticMarkup(React.createElement(component, {}))
    );
  }
}

