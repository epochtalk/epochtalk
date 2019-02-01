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
    color.clear().sendKeys(1);
    return browser.waitForAngular()
    .then(function() {
      expect(helper.hasClass(color, 'ng-invalid')).toBe(true);
      expect(helper.hasClass(color, 'ng-dirty')).toBe(true);
    });
  });

  it('A non-color string should be an invalid color', function() {
    color.clear().sendKeys('invalid-color');
    return browser.waitForAngular()
    .then(function() {
      expect(helper.hasClass(color, 'ng-invalid')).toBe(true);
      expect(helper.hasClass(color, 'ng-dirty')).toBe(true);
    });
  });

  // Positive test cases
  it('A color string should be a valid color', function() {
    color.clear().sendKeys('white');
    return browser.waitForAngular()
    .then(function() {
      expect(helper.hasClass(color, 'ng-valid')).toBe(true);
      expect(helper.hasClass(color, 'ng-dirty')).toBe(true);
    });
  });

  it('Shorthand hexadecimal values should be a valid color', function() {
    color.clear().sendKeys('#fff');
    return browser.waitForAngular()
    .then(function() {
      expect(helper.hasClass(color, 'ng-valid')).toBe(true);
      expect(helper.hasClass(color, 'ng-dirty')).toBe(true);
    });
  });

  it('Hexadecimal values should be a valid color', function() {
    color.clear().sendKeys('#ffffff');
    return browser.waitForAngular()
    .then(function() {
      expect(helper.hasClass(color, 'ng-valid', true)).toBe(true);
      expect(helper.hasClass(color, 'ng-dirty', true)).toBe(true);
    });
  });

  it('RGB values should be a valid color', function() {
    color.clear().sendKeys('rgb(255,255,255)');
    return browser.waitForAngular()
    .then(function() {
      expect(helper.hasClass(color, 'ng-valid')).toBe(true);
      expect(helper.hasClass(color, 'ng-dirty')).toBe(true);
    });
  });

  it('RGBA values should be a valid color', function() {
    color.clear().sendKeys('rgba(255,255,255,0.5)');
    return browser.waitForAngular()
    .then(function() {
      expect(helper.hasClass(color, 'ng-valid')).toBe(true);
      expect(helper.hasClass(color, 'ng-dirty')).toBe(true);
    });
  });

  it('HSL values should be a valid color', function() {
    color.clear().sendKeys('hsl(120, 100%, 50%)');
    return browser.waitForAngular()
    .then(function() {
      expect(helper.hasClass(color, 'ng-valid')).toBe(true);
      expect(helper.hasClass(color, 'ng-dirty')).toBe(true);
    });
  });

  it('HSLA values should be a valid color', function() {
    color.clear().sendKeys('hsla(120, 100%, 50%, 0.5)')
    return browser.waitForAngular()
    .then(function(){
      expect(helper.hasClass(color, 'ng-valid')).toBe(true);
      expect(helper.hasClass(color, 'ng-dirty')).toBe(true);
    });
  });

});
