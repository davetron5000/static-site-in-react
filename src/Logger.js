import { sprintf } from "sprintf-js"
import chalk from "chalk"
import path from "path"

let instance = null;

export default class Logger {

  constructor(log_device) {
    this.log_device = log_device || console
  }

  log (message) {
    let location = "unknown location"
    const stack = (new Error()).stack
    if (stack) {
      const line = stack.split(/\n/)[3]
      if (line) {
        const parts = line.split(/\//);
        location = parts[parts.length - 1];
      }
    }
    const annotated_message = sprintf("[%s](%s): %s",
      chalk.blue.dim("static-site-in-react"),
      chalk.yellow.dim(location),
      chalk.white.bold(message))
    this.log_device.log(annotated_message)
  }

  static log(message) { return instance.log(message) }

  log_error (message) {
    this.log(chalk.red(`ERROR: ${message}`))
  }

  static log_error(message) { return instance.log_error(message) }

  log_and_return_value (value, message_string) {
    this.log(sprintf(message_string, chalk.greenBright(value)))
    return value
  }

  static log_and_return_value(value, message_string) {
    return instance.log_and_return_value(value,message_string)
  }
}

instance = new Logger(console)
