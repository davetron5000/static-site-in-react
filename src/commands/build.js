require("@babel/register")({
  presets: ["@babel/preset-react"],
  plugins: ["transform-es2015-modules-commonjs"]
});

const process = require("process")
const Main    = require("../Main").default
const Runner  = require("../Runner").default

const runner = new Runner(process.env, new Main())

process.exit(runner.run())
