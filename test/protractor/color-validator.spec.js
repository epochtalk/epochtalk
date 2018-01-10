var path = require('path');
var helper = require(path.join(__dirname, 'helper'));

describe('Directive: Color Validator', function() {
  var color = element(by.id('base-background-color'));

  // Init for test
  helper.login()
  .then(function() {
    browser.get(helper.host + '/admin/settings/theme');
  });

  it('"invalid-color" should be an invalid color', function() {
    color.clear();
    color.sendKeys('invalid-color');
    expect(helper.hasClass(color, 'ng-invalid')).toBe(true);
    expect(helper.hasClass(color, 'ng-dirty')).toBe(true);
  });

  it('"#ccc" should be a valid color', function() {
    color.clear();
    color.sendKeys('#ccc');
    expect(helper.hasClass(color, 'ng-valid')).toBe(true);
    expect(helper.hasClass(color, 'ng-dirty')).toBe(true);
  });

});
