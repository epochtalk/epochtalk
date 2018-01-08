// conf.js
exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['./test/protractor/color-validator.spec.js'],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: [ '--headless', '--disable-gpu', '--window-size=800,600' ]
    }
  },
  onPrepare: function() {
    browser.get('http://localhost:8080');

    element(by.id('login-link')).click();

    element(by.id('login-user')).sendKeys('admin');
    element(by.id('login-pass')).sendKeys('admin1234');

    element(by.id('login-btn')).click();

    return browser.wait(function() {
      return element(by.id('user-dropdown-wrap')).isPresent();
    }, 10000);
  }
};
