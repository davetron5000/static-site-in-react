import { sprintf } from "sprintf-js"
import chalk from "chalk"
import path from "path"

const log = (message) => {
  let location = "unknown location"
  const stack = (new Error()).stack
  if (stack) {
    const line = stack.split(/\n/)[2]
    if (line) {
      const parts = line.split(/\//);
      location = parts[parts.length - 1];
    }
  }
  const annotated_message = sprintf("[%s](%s): %s",
    chalk.blue.dim("static-site-in-react"),
    chalk.yellow.dim(location),
    chalk.white.bold(message))
  console.log(annotated_message)
}
const log_error = (message) => {
  log(chalk.red(`ERROR: ${message}`))
}

const log_and_return_value = (value, message_string) => {
  log(sprintf(message_string, chalk.greenBright(value)))
  return value
}

export {
  log,
  log_error,
  log_and_return_value
}
