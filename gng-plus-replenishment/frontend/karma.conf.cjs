// اجرای آزمون‌ها در حالت بدون رابط گرافیکی برای CI
process.env.CHROME_BIN = process.env.CHROME_BIN || '/opt/pw-browsers/chromium';

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    reporters: ['progress'],
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--headless=new']
      }
    },
    restartOnFileChange: true
  });
};
