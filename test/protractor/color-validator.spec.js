var path = require('path');
var helper = require(path.join(__dirname, 'helper'));

describe('Directive: Color Validator', function() {
  var color = element(by.id('base-background-color'));

  // Init for test
  helper.login()
  .then(function() {
    browser.get(helper.host + '/admin/settings/theme');
  });

  // Negative test cases
  it('A number should be an invalid color', function() {
    color.clear();
    color.sendKeys(1);
    expect(helper.hasClass(color, 'ng-invalid')).toBe(true);
    expect(helper.hasClass(color, 'ng-dirty')).toBe(true);
  });

  it('A non-color string should be an invalid color', function() {
    color.clear();
    color.sendKeys('invalid-color');
    expect(helper.hasClass(color, 'ng-invalid')).toBe(true);
    expect(helper.hasClass(color, 'ng-dirty')).toBe(true);
  });

  // Positive test cases
  it('A color string should be a valid color', function() {
    color.clear();
    color.sendKeys('white');
    expect(helper.hasClass(color, 'ng-valid')).toBe(true);
    expect(helper.hasClass(color, 'ng-dirty')).toBe(true);
  });

  it('Shorthand hexadecimal values should be a valid color', function() {
    color.clear();
    color.sendKeys('#fff');
    expect(helper.hasClass(color, 'ng-valid')).toBe(true);
    expect(helper.hasClass(color, 'ng-dirty')).toBe(true);
  });

  it('Hexadecimal values should be a valid color', function() {
    color.clear();
    color.sendKeys('#ffffff');
    expect(helper.hasClass(color, 'ng-valid')).toBe(true);
    expect(helper.hasClass(color, 'ng-dirty')).toBe(true);
  });

  it('RGB values should be a valid color', function() {
    color.clear();
    color.sendKeys('rgb(255,255,255)');
    expect(helper.hasClass(color, 'ng-valid')).toBe(true);
    expect(helper.hasClass(color, 'ng-dirty')).toBe(true);
  });

  it('RGBA values should be a valid color', function() {
    color.clear();
    color.sendKeys('rgba(255,255,255,0.5)');
    expect(helper.hasClass(color, 'ng-valid')).toBe(true);
    expect(helper.hasClass(color, 'ng-dirty')).toBe(true);
  });

  it('HSL values should be a valid color', function() {
    color.clear();
    color.sendKeys('hsl(120, 100%, 50%)');
    expect(helper.hasClass(color, 'ng-valid')).toBe(true);
    expect(helper.hasClass(color, 'ng-dirty')).toBe(true);
  });

  it('HSLA values should be a valid color', function() {
    color.clear();
    color.sendKeys('hsla(120, 100%, 50%, 0.5)');
    expect(helper.hasClass(color, 'ng-valid')).toBe(true);
    expect(helper.hasClass(color, 'ng-dirty')).toBe(true);
  });

  it('Fail on purpose', function() {
    color.clear();
    color.sendKeys('hsla(120, 100%, 50%, 0.5)');
    expect(helper.hasClass(color, 'ng-valid')).toBe(false);
    expect(helper.hasClass(color, 'ng-dirty')).toBe(false);
  });

});
