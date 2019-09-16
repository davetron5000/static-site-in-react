const child_process = require("child_process")
const process = require("process")
const path = require("path")
const fs = require("fs")

const exec_and_log = (command, exec_options) => {
  let stdout;
  expect( () => {
    stdout = child_process.execSync(command, exec_options)
  }).not.toThrow()
  const annotated_lines = stdout.toString().split(/\n/).map( (line) => {
    return `[    stdout of ${command}] ${line}`
  })
  const entire_string = `> ${command}\n` + annotated_lines.join("\n") + `\n[END stdout of ${command}]`
  console.log(entire_string)
}

expect.extend({
  toExistAsFile(file_name) {
    if (fs.existsSync(file_name)) {
      return {
        message: () => `expected ${file_name} not to exist`,
        pass: true
      }
    }
    else {
      return {
        message: () => `expected ${file_name} exist`,
        pass: false
      }
    }
  }
})

expect.extend({
  toHaveSameContentsAsFile(file_name, source_file) {
    if (fs.existsSync(file_name)) {
      const expected_contents = fs.readFileSync(source_file)
      const actual_contents = fs.readFileSync(file_name)
      if (expected_contents.compare(actual_contents) === 0) {
        return {
          message: () => `expected ${file_name} not to contain the same contents as ${source_file}`,
          pass: true
        }
      }
      else {
        return {
          message: () => `expected ${file_name} to contain the same contents as ${source_file} (${typeof expected_contents}):\n\n'${expected_contents}'\n\nbut it contained (${typeof actual_contents}):\n\n'${actual_contents}'`,
          pass: false
        }
      }
    }
    else {
      return {
        message: () => `expected ${file_name} exist`,
        pass: false
      }
    }
  }
})

expect.extend({
  toHaveWebpackInsertedContent(file_name) {
    if (fs.existsSync(file_name)) {
      const file_contents = fs.readFileSync(file_name)
      if (file_contents.indexOf("styles.css") != -1) {
        if (file_contents.indexOf("main.js") != -1) {
          return {
            message: () => `expected ${file_name} not to contain a reference to 'main.js' or 'styles.css', but it did.  contents:\n\n${file_contents}`,
            pass: true
          }
        }
        else {
          return {
            message: () => `expected ${file_name} to contain a reference to 'main.js', but it didn't.  contents:\n\n${file_contents}`,
            pass: false
          }
        }
      }
      else {
        return {
          message: () => `expected ${file_name} to contain a reference to 'styles.css', but it didn't.  contents:\n\n${file_contents}`,
          pass: false
        }
      }
    }
    else {
      return {
        message: () => `expected ${file_name} exist`,
        pass: false
      }
    }
  }
})

expect.extend({
  toBeMoreThanAFewLinesLong(file_name) {
    if (fs.existsSync(file_name)) {
      const file_length = fs.readFileSync(file_name).toString().split(/\n/).length
      if (file_length > 10) {
        return {
          message: () => `expected ${file_name} to have fewer than 10 lines, but had ${file_length}`,
          pass: true
        }
      }
      else {
        return {
          message: () => `expected ${file_name} to have more than 10 lines, but had ${file_length}`,
          pass: false
        }
      }
    }
    else {
      return {
        message: () => `expected ${file_name} exist`,
        pass: false
      }
    }
  }
})

test("Building the site", () => {
  /*
   * 1. Clean up previous site
   * 1. Generate site
   * 1. Assert what got built
   */

  const test_root = path.resolve(path.join(__dirname,"..", "root"))
  const env = Object.assign({}, process.env)
  env["BUILD_ENV"] = "test"
  const exec_options = {
    cwd: test_root,
    env: env
  }
  exec_and_log("rm -rf deploy_to_test", exec_options)
  exec_and_log("rm -rf webpack_input_test", exec_options)
  exec_and_log("yarn build", exec_options)

  const site_output = path.join(test_root,"deploy_to_test")
  const site_input = path.join(test_root, "site")

  expect(site_output).toExistAsFile()
  const check_for_webpack_inserted_content = (original_file, destination_file) => {
    const destination_file_contents = fs.readFileSync(destination_file).toString()
    if (destination_file_contents.indexOf("styles.css") != -1) {
      if (destination_file_contents.indexOf("main.js") != -1) {
        return true
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }

  const files = {
    "index.html": "toHaveWebpackInsertedContent",
    "images": {
      "foo.jpg": "identical",
      "subdir": {
        "bar.png": "identical"
      }
    },
    "styles.css": "toBeMoreThanAFewLinesLong",
    "main.js": "toBeMoreThanAFewLinesLong",
    "about": {
      "bio.html": "toHaveWebpackInsertedContent",
      "site.html": "toHaveWebpackInsertedContent"
    }
  }

  const assert_files = (source, destination, file_list) => {
    Object.entries(file_list).forEach( (pair) => {
      const eval_strategy = pair[1];
      if (eval_strategy == "identical") {
        const file_name = pair[0]
        const source_file = path.join(source, file_name)
        const destination_file = path.join(destination, file_name)

        expect(destination_file).toHaveSameContentsAsFile(source_file)
      }
      else if (eval_strategy == "exists") {
        const file_name = pair[0]
        const source_file = path.join(source, file_name)
        const destination_file = path.join(destination, file_name)

        expect(destination_file).toExistAsFile()
      }
      else if (typeof eval_strategy === "string") {
        const file_name = pair[0]
        const check_function = pair[1]
        const destination_file = path.join(destination, file_name)

        expect(destination_file)[check_function]()
      }
      else {
        const dir_name = pair[0]
        const files_in_dir = pair[1]

        assert_files(path.join(source, dir_name),
          path.join(destination,dir_name),
          files_in_dir)
      }
    })
  }

  assert_files(site_input, site_output, files)
})
