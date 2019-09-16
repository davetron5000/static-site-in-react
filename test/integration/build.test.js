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
  const files = {
    "index.html": true,
    "images": {
      "foo.jpg": true,
      "bar.png": true
    },
    /*
    "css": {
      "styles.css": true
    },
    "js":  {
      "index.js": true
    },
    */
    "about": {
      "bio.html": true,
      "site.html": true
    }
  }

  const assert_files = (source, destination, file_list) => {
    Object.entries(file_list).forEach( (pair) => {
      if (pair[1] === true) {
        const file_name = pair[0]
        const source_file = path.join(source, file_name)
        const destination_file = path.join(destination, file_name)

        expect(destination_file).toHaveSameContentsAsFile(source_file)
        // and more
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
