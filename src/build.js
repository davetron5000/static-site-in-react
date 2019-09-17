require("@babel/register")({
  presets: ["@babel/preset-react"],
  plugins: ["transform-es2015-modules-commonjs"]
});

const child_process = require("child_process")
const process       = require("process")
const path          = require("path")
const fs            = require("fs")
const chalk         = require("chalk")

const { log, log_error } = require("./log")
const { load_config }    = require("./config_file")

const FileToCopy = require("./FileToCopy").default

const main = () => {
  const config = load_config(process.env)

  const mkdir_p = (path) => {
    if (fs.existsSync(path)) {
      log(`directory "${path}" already exists`)
    }
    else {
      log(`creating directory '${path}'`)
      fs.mkdirSync(path)
    }
  }

  copy_files = (from_dir, to_dir) => {
    log(chalk`Copying files from '{cyan ${from_dir}}' to '{yellow ${to_dir}}'`)

    const files = fs.readdirSync(from_dir)

    files.forEach( (file) => {
      const file_to_copy = new FileToCopy(file, from_dir, to_dir)

      const result = file_to_copy.ensure_destination()

      if (result.is_directory) {
        copy_files(
          file_to_copy.path_to_source_file,
          file_to_copy.path_to_destination_file
        )
      }
    })
  }

  mkdir_p(config.webpack_input_path)
  copy_files(config.input_path, config.webpack_input_path)
}

let runner = (main) => {
  try {
    main()
  }
  catch (error) {
    log_error(error.message)
    process.exit(1)
  }
}

if ( (process.env.BUILD_ENV == "test") ||
     (process.env.DEBUG == "true") ) {
  runner = (main) => {
    main()
  }
}

runner(main)
