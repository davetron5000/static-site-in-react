const Logger = require("./Logger").default

export default class Runner {
  constructor(env, main) {
    this.env  = env
    this.main = main
  }

  run() {
    if (process.env.BUILD_ENV == "test") {
      Logger.log("'test' environment detected; using exception-throwing runner")
      return this.exception_throwing_runner()
    }
    if (process.env.DEBUG == "true") {
      Logger.log("DEBUG set to 'true'; using exception-throwing runner")
      return this.exception_throwing_runner()
    }
    Logger.log("Trapping all exceptions. Use DEBUG=true to see stack traces")
    return this.normal_runner()
  }
  exception_throwing_runner() {
    this.main.run()
    return 0
  }

  normal_runner() {
    try {
      this.exception_throwing_runner()
    }
    catch (error) {
      Logger.log_error(error)
      return 1
    }
  }
}
