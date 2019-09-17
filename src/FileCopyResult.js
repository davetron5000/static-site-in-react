import chalk from "chalk"

export default class FileCopyResult {
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
    return chalk`FileToCopyResult [
  from       : '{green ${this.source_path}}'
    modified : {yellow ${this.source_mtimeMs}}
  to         : '{green ${this.destination_path}}'
${ this.destination_mtimeMs ? chalk`    modified : {yellow ${this.destination_mtimeMs}}` : "" }
  type       : {green ${this.is_file ? 'file' : 'directory' }}
  action     : {cyan ${this.action}}, reason '{yellow ${this.reason}}'
]`
  }
}

