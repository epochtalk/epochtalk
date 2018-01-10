var SpecReporter = require('jasmine-spec-reporter').SpecReporter;
require('dotenv').load({ path: 'protractor.env', slient: true });

// conf.js
exports.config = {
  framework: 'jasmine',
  seleniumAddress: process.env.SELENIUM_HOST + ':' + process.env.SELENIUM_PORT + '/wd/hub',
  specs: ['./test/protractor/color-validator.spec.js'],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: [ '--headless', '--disable-gpu', '--window-size=800,600' ]
    }
  },
  onPrepare: function() {
    jasmine.getEnv().addReporter(new SpecReporter({
      spec: {
        displayStacktrace: true
      }
    }));
  }
};
