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
        if (file_contents.indexOf("bundle.js") != -1) {
          return {
            message: () => `expected ${file_name} not to contain a reference to 'bundle.js' or 'styles.css', but it did.  contents:\n\n${file_contents}`,
            pass: true
          }
        }
        else {
          return {
            message: () => `expected ${file_name} to contain a reference to 'bundle.js', but it didn't.  contents:\n\n${file_contents}`,
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
  toHaveHashedWebpackInsertedContent(file_name) {
    if (fs.existsSync(file_name)) {
      const file_contents = fs.readFileSync(file_name).toString()
      if (file_contents.match(/styles-\w+.css/)) {
        if (file_contents.match(/bundle-\w+.js/)) {
          return {
            message: () => `expected ${file_name} not to contain a reference to the hashed 'bundle.js' or the hashed 'styles.css', but it did.  contents:\n\n${file_contents}`,
            pass: true
          }
        }
        else {
          return {
            message: () => `expected ${file_name} to contain a reference to the hashed 'bundle.js', e.g. bundle-qwrqwerq2343.js, but it didn't.  contents:\n\n${file_contents}`,
            pass: false
          }
        }
      }
      else {
        return {
          message: () => `expected ${file_name} to contain a reference to hashed 'styles.css', e.g. styles-98098098092890.css, but it didn't.  contents:\n\n${file_contents}`,
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
  toHaveBeenRenderedByReact(file_name) {
    if (fs.existsSync(file_name)) {
      const file_contents = fs.readFileSync(file_name)
      if ( 
        (file_contents.indexOf("<!DOCTYPE html>") != -1) ||
        (file_contents.indexOf("<!doctype html>") != -1) 
      ) {

        if (file_contents.indexOf("<html") != -1) {
          return {
            message: () => `expected ${file_name} not to contain <!DOCTYPE html> or <html, but it did.  contents:\n\n${file_contents}`,
            pass: true
          }
        }
        else {
          return {
            message: () => `expected ${file_name} to contain a <html, but it didn't.  contents:\n\n${file_contents}`,
            pass: false
          }
        }
      }
      else {
        return {
          message: () => `expected ${file_name} to contain a <!DOCTYPE html>, but it didn't.  contents:\n\n${file_contents}`,
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

expect.extend({
  toHaveBeenMinifiedAndHashed(file_name) {
    const parsed_path = path.parse(file_name)
    const dir = parsed_path.dir
    const file_name_regexp = new RegExp(`${parsed_path.name}-\\w+${parsed_path.ext}`)

    const matching_files = fs.readdirSync(dir).filter( (file_in_dir) => {
      return file_in_dir.match(file_name_regexp)
    })

    if (matching_files.length === 1) {
      return {
        message: () => `expected not to find a file that matched ${file_name_regexp} in ${dir}, but did`,
        pass: true
      }
    }
    else if (matching_files.length > 1) {
      return {
        message: () => `expected to find exactly one file that matched ${file_name_regexp} in ${dir}, but found ${matching_files.length}`,
        pass: false
      }
    }
    else {
      return {
        message: () => `expected to find a file that matched ${file_name_regexp} in ${dir}, but did not`,
        pass: false
      }
    }
  }
})

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
    else if (Array.isArray(eval_strategy)) {
      const file_name = pair[0]
      const destination_file = path.join(destination, file_name)

      expect(eval_strategy.length > 0).toBe(true)
      eval_strategy.forEach( (check_function) => {
        expect(destination_file)[check_function]()
      });
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
  expect(path.join(site_output,"components")).not.toExistAsFile()

  /** This basically is a list of the files in our test site root, mapping
   * to the way in which we will evaluate if the build system did the right thing to them.
   *
   * "identical" means the file should just be a byte-for-byte copy
   * "exists" means we just care that it exists (likely not a good thing to only test for)
   *
   * Any other string is expected to be a zero-arg expectation we'll use to evaulate. An array
   * of strings is expected to be an array of zero-arg expectations that must all pass.
   *
   * An object is assumed to map to a nested directory structure.
   */
  const files = {
    "index.html": [ "toHaveWebpackInsertedContent", "toHaveBeenRenderedByReact" ],
    "foo.html": [ "toHaveWebpackInsertedContent", "toHaveBeenRenderedByReact" ],
    "images": {
      "foo.jpg": "identical",
      "subdir": {
        "bar.png": "identical"
      }
    },
    "styles.css": "toBeMoreThanAFewLinesLong",
    "bundle.js": "toBeMoreThanAFewLinesLong",
    "about": {
      "bio.html": [ "toHaveWebpackInsertedContent", "toHaveBeenRenderedByReact" ],
      "site.html": "toHaveWebpackInsertedContent"
    }
  }

  assert_files(site_input, site_output, files)
})
test("Building the site for prod", () => {
  /*
   * 1. Clean up previous site
   * 1. Generate site
   * 1. Assert what got built
   */

  const test_root = path.resolve(path.join(__dirname,"..", "root"))
  const env = Object.assign({}, process.env)
  env["BUILD_ENV"] = "test-production"
  const exec_options = {
    cwd: test_root,
    env: env
  }
  exec_and_log("rm -rf deploy_to_test-production", exec_options)
  exec_and_log("rm -rf webpack_input_test-production", exec_options)
  exec_and_log("yarn build", exec_options)

  const site_output = path.join(test_root,"deploy_to_test-production")
  const site_input = path.join(test_root, "site")

  expect(site_output).toExistAsFile()
  expect(path.join(site_output,"components")).not.toExistAsFile()

  /** This basically is a list of the files in our test site root, mapping
   * to the way in which we will evaluate if the build system did the right thing to them.
   *
   * "identical" means the file should just be a byte-for-byte copy
   * "exists" means we just care that it exists (likely not a good thing to only test for)
   *
   * Any other string is expected to be a zero-arg expectation we'll use to evaulate. An array
   * of strings is expected to be an array of zero-arg expectations that must all pass.
   *
   * An object is assumed to map to a nested directory structure.
   */
  const files = {
    "index.html": [ "toHaveHashedWebpackInsertedContent", "toHaveBeenRenderedByReact" ],
    "foo.html": [ "toHaveHashedWebpackInsertedContent", "toHaveBeenRenderedByReact" ],
    "images": {
      "foo.jpg": "identical",
      "subdir": {
        "bar.png": "identical"
      }
    },
    "styles.css": "toHaveBeenMinifiedAndHashed",
    "bundle.js": "toHaveBeenMinifiedAndHashed",
    "about": {
      "bio.html": [ "toHaveHashedWebpackInsertedContent", "toHaveBeenRenderedByReact" ],
      "site.html": "toHaveHashedWebpackInsertedContent",
    }
  }

  assert_files(site_input, site_output, files)
})
