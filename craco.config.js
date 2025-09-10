const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add fallbacks for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "path": require.resolve("path-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "buffer": require.resolve("buffer"),
        "fs": false,
        "os": false,
        "util": require.resolve("util"),
        "assert": require.resolve("assert"),
        "constants": require.resolve("constants-browserify"),
        "vm": require.resolve("vm-browserify"),
        "process": require.resolve("process/browser"),
      };

      // Add plugins
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );

      // Handle XLSX module resolution
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'process/browser': require.resolve('process/browser'),
      };

      return webpackConfig;
    },
  },
};
