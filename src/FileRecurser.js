import Logger        from "./Logger"
import fs            from "fs"
import chalk         from "chalk"
import FileToCopy    from "./FileToCopy"

export default class FileRecurser {

  recurse(from_dir, to_dir, f) {
    Logger.log(chalk`Recursing files from '{cyan ${from_dir}}'`)
    const files = fs.readdirSync(from_dir)

    files.forEach( (file) => {
      const file_to_copy = FileToCopy.for_file(file, from_dir, to_dir)

      const result = f(file_to_copy)

      if (file_to_copy.is_directory()) {
        Logger.log(`${file_to_copy.path_to_source_file} is a directory (${file_to_copy.class_name()})`)
        this.recurse(
          file_to_copy.path_to_source_file,
          file_to_copy.path_to_destination_file,
          f
        )
      }
    })
  }
}
