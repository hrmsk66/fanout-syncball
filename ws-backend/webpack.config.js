const path = require("path");
const webpack = require("webpack");
const { ProvidePlugin } = webpack;

module.exports = {
  entry: "./src/index.js",
  optimization: {
    minimize: true,
  },
  target: "webworker",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "bin"),
    libraryTarget: "this",
  },
  module: {
    // Asset modules are modules that allow the use asset files (fonts, icons, etc)
    // without additional configuration or dependencies.
    rules: [
      // asset/source exports the source code of the asset.
      // Usage: e.g., import notFoundPage from "./page_404.html"
      {
        test: /\.(txt|html)/,
        type: "asset/source",
      },
    ],
  },
  plugins: [
    // Polyfills go here.
    // Used for, e.g., any cross-platform WHATWG,
    // or core nodejs modules needed for your application.
    new ProvidePlugin({
      process: "process",
      Buffer: ["buffer", "Buffer"],
    }),
  ],
  resolve: {
    // npm i @fanoutio/grip @fastly/grip-compute-js
    // npm i --save-dev buffer querystring-es3 url crypto-browserify util stream-browserify process
    fallback: {
      buffer: require.resolve("buffer/"),
      querystring: require.resolve("querystring-es3"),
      url: require.resolve("url/"),
      crypto: require.resolve("crypto-browserify"),
      util: require.resolve("util/"),
      stream: require.resolve("stream-browserify"),
      process: require.resolve("process"),
    },
  },
};
