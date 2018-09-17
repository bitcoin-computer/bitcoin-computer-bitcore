// karma.conf.js
module.exports = function (config) {
  config.set({
    browsers: ['Firefox'],
    frameworks: ['mocha', 'detectBrowsers'],
    detectBrowsers: {
      enabled: true,
      usePhantomJS: false,
      postDetection(availableBrowser) {
        // modify to enable additional browsers if available
        const runBrowsers = ['Firefox', 'Chrome'];
        const browsers = [];
        for (let i = 0; i < runBrowsers.length; i += 1) {
          if (~availableBrowser.indexOf(runBrowsers[i])) {
            browsers.push(runBrowsers[i]);
          }
        }
        return browsers;
      },
    },
    singleRun: true,
    files: [
      '.build/tests.js',
    ],
    plugins: [
      'karma-mocha',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-detect-browsers',
    ],
  });
};
