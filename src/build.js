require("@babel/register")({
  presets: ["@babel/preset-react"],
  plugins: ["transform-es2015-modules-commonjs"]
});

const process            = require("process")
const { log, log_error } = require("./log")
const main               = require("./main").default

let runner = (main) => {
  try {
    log("Trapping exceptions.  Set DEBUG=true to allow them to leak through")
    main()
  }
  catch (error) {
    log_error(error.message)
    process.exit(1)
  }
}

if ( (process.env.BUILD_ENV == "test") ||
     (process.env.DEBUG == "true") ) {
  log("Will not trap exceptions")
  runner = (main) => {
    main()
  }
}

runner(main)
