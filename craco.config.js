module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Extend babel-loader to properly transpile recharts and lodash-es
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
