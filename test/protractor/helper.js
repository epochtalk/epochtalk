exports.hasClass = function (element, cls) {
  return element.getAttribute('class').then(function (classes) {
    return classes.split(' ').indexOf(cls) !== -1;
  });
};

exports.login = function() {
  browser.get('http://localhost:8080');

  element(by.id('login-link')).click();

  element(by.id('login-user')).sendKeys('admin');
  element(by.id('login-pass')).sendKeys('admin1234');

  element(by.id('login-btn')).click();

  return browser.wait(function() {
    return element(by.id('user-dropdown-wrap')).isPresent();
  }, 10000);
};
