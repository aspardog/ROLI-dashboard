const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Remove ModuleScopePlugin so that imports outside src/ are allowed.
      // This is needed because App.js lives at the project root.
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        (plugin) => plugin.constructor.name !== 'ModuleScopePlugin'
      );

      // Extend the app babel-loader (the one with include: src/) so it also
      // processes JSX in files at the project root (e.g. App.js).
      const appRoot = path.resolve(__dirname);
      const oneOf = webpackConfig.module.rules.find((rule) => rule.oneOf);
      if (oneOf) {
        oneOf.oneOf.forEach((rule) => {
          if (rule.loader && rule.loader.includes('babel-loader')) {
            // Remove the include restriction to transpile node_modules
            delete rule.include;
            // Exclude only specific packages that are known to be ES5
            rule.exclude = /node_modules\/(?!(lodash-es|recharts))/;
          }
        });
      }

      return webpackConfig;
    },
  },
};
