import fs             from "fs"
import path           from "path"
import chalk          from "chalk"
import MarkdownIt     from "markdown-it"
import React          from "react";
import ReactDOMServer from "react-dom/server";
import { parse }      from "node-html-parser";

import Logger         from "./Logger"
import FileCopyResult from "./FileCopyResult"
import RegularFile    from "./RegularFile"

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  xhtmlOut: true,
});


export default class MarkdownTemplateFile extends RegularFile {
  constructor(file_name, source_path, destination_path) {
    super(file_name, source_path, destination_path)

    if (!file_name.match(/\.html\.md$/i)) {
      throw `MarkdownTemplateFile cannot be used on ${file_name}, as it does not end in .html.md`
    }
    this.path_to_destination_file = path.join(destination_path, file_name.replace(/\.md/i,""))
  }

  is_html() { return true }

  is_directory() { return false; }

  ensure_destination() {
    const result = new FileCopyResult("copy to webpack", this)

    const source_stat = fs.lstatSync(this.path_to_source_file)

    result.source_modified_at(source_stat.mtimeMs)

    result.source_is_file(true)
    result.set_action("rendered file", "always render since we don't know if React components changed yet")

    this._render_file()

    Logger.log(result.toString())
    return result
  }

  class_name() { return "MarkdownTemplateFile" }

  metadata() {
    let metadata = super.metadata()
    const [ front_matter, markdown_lines ] = this._parse_file()
    const html = md.render(markdown_lines.join("\n")).replace(/\`/,"\\`")

    const parsed = parse(html)
    Logger.log(parsed.querySelector("p").toString())
    front_matter.excerpt = parsed.querySelector("p").toString()

    metadata = Object.assign(metadata, front_matter)

    return metadata
  }

  _render_file() {
    const [ front_matter, markdown_lines ] = this._parse_file()
    const html = md.render(markdown_lines.join("\n")).replace(/\`/,"\\`")

    if (front_matter.component) {
      const component_name = front_matter.component
      const html_jsx_file = this.path_to_source_file.replace(/\.md$/,".md.jsx")

      Logger.log(`Writing JSX files to ${html_jsx_file}`)

      const path_to_components = this._derive_path_to_react_components()

      fs.writeFileSync(
        html_jsx_file,
        `import React from "react";
import ${component_name} from "${path_to_components}/components/${component_name}";

const page = JSON.parse('${JSON.stringify(front_matter)}')
const html = \`${html}\`

export default function(props) {
  return(
    <${component_name} page={page}>
      <div dangerouslySetInnerHTML={ {__html: html } } />
    </${component_name}>
  );
}`);
      delete require.cache[require.resolve(html_jsx_file)]
      const component = require(html_jsx_file).default;
      fs.writeFileSync(
        this.path_to_destination_file,
        "<!DOCTYPE html>" +
        ReactDOMServer.renderToStaticMarkup(React.createElement(component, {}))
      );
      Logger.log(`Deleting intermediate file '${html_jsx_file}'`)
      fs.unlinkSync(html_jsx_file)
    }
    else {
      fs.writeFileSync(
        this.path_to_destination_file,
        "<!DOCTYPE html>" + html
      )
    }
  }

  _parse_file() {
    const file_lines = fs.readFileSync(this.path_to_source_file).toString().split(/\n/)

    let markdown_lines = null;
    let front_matter = {};

    if (file_lines[0] === "---") {
      const end_of_front_matter_index = file_lines.indexOf("---",1)
      if (end_of_front_matter_index === -1) {
        Logger.log("Detected start of front-matter, but no end. Assuming no front-matter and parsing as-is")
        markdown_lines = file_lines
      }
      else {
        markdown_lines = file_lines.slice(end_of_front_matter_index + 1)
        const front_matter_lines = file_lines.slice(1,end_of_front_matter_index)
        Logger.log(`Front-matter detected:\n${front_matter_lines.join("\n")}`)
        front_matter = JSON.parse(front_matter_lines.join("\n"))
        Logger.log(`Front-matter parsed as:\n${JSON.stringify(front_matter, null, '  ')}`)
      }
    }
    else {
      Logger.log("No front-matter - parsing as is")
      markdown_lines = file_lines
    }
    return [ front_matter, markdown_lines ]
  }


  _derive_path_to_react_components() {
    const relative_url_parts = this.relative_url.split(/\//);
    const relative_url_paths = relative_url_parts.slice(2);

    let path_to_components = relative_url_paths.map( (part) => {
      return ".."
    }).join("/")

    if (path_to_components === "") {
      path_to_components = "."
    }
    Logger.log(`path_to_components is ${path_to_components}`)
    return path_to_components
  }
}

