require('dotenv').load({ path: 'protractor.env', slient: true });

var host = exports.host = process.env.SELENIUM_EPOCHTALK_HOST + ':' + process.env.SELENIUM_EPOCHTALK_PORT;

exports.hasClass = function (element, cls, log) {
  return element.getAttribute('class').then(function (classes) {
    classes = classes.split(' ');
    if (log) { console.log(JSON.stringify(classes, null, 2)); }
    return classes.indexOf(cls) !== -1;
  });
};

exports.login = function() {
  browser.get(host);

  element(by.id('login-link')).click();

  element(by.id('login-user')).sendKeys(process.env.ADMIN_USERNAME);
  element(by.id('login-pass')).sendKeys(process.env.ADMIN_PASSWORD);

  element(by.id('login-btn')).click();

  return browser.wait(function() {
    return element(by.id('user-dropdown-wrap')).isPresent();
  }, 10000);
};
