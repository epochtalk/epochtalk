var directive = ['AutoModeration', 'Alert', 'Session',
  function(AutoModeration, Alert, Session) {
  return {
    restrict: 'E',
    scope: true,
    bindToController: { user: '=' },
    template: require('./auto-moderation.html'),
    controllerAs: 'vm',
    controller: [function() {
      var ctrl = this;
      ctrl.rules = [];
      this.viewedRule = {name:'', conditions:[], actions: [], options: {edit: {}}};

      this.canViewRules = function() {
        var authed = Session.isAuthenticated();
        var permed = Session.hasPermission('autoModeration.rules.allow');
        if (authed && permed) { return true; }
        else { return false; }
      };

      this.canCreateRule = function() {
        var authed = Session.isAuthenticated();
        var permed = Session.hasPermission('autoModeration.addRule.allow');
        if (authed && permed) { return true; }
        else { return false; }
      };

      this.canEditRule = function() {
        var authed = Session.isAuthenticated();
        var permed = Session.hasPermission('autoModeration.editRule.allow');
        if (authed && permed) { return true; }
        else { return false; }
      };

      this.canRemoveRule = function() {
        var authed = Session.isAuthenticated();
        var permed = Session.hasPermission('autoModeration.removeRule.allow');
        if (authed && permed) { return true; }
        else { return false; }
      };

      this.createRule = function() {
        ctrl.viewedRule = {name:'', conditions:[], actions: [], options: {edit: {}}};
        ctrl.viewable = true;
      };

      this.viewable = false;
      this.viewRule = function(rule) {
        ctrl.viewedRule = rule;
        ctrl.viewable = true;
      };

      this.deletable = false;
      this.deleteRule = function(rule) {
        ctrl.deletedRule = rule;
        ctrl.deletable = true;
      };

      this.addCondition = function() {
        var newCondition = { param: '', regex: { pattern: '', flags: '' } };
        ctrl.viewedRule.conditions.push(newCondition);
      };

      this.removeCondition = function(index) {
        ctrl.viewedRule.conditions.splice(index, 1);
      };

      this.toggleActionSelection = function(action) {
        var idx = ctrl.viewedRule.actions.indexOf(action);
        // is currently selected
        if (idx > -1) { ctrl.viewedRule.actions.splice(idx, 1); }
        // is newly selected
        else { ctrl.viewedRule.actions.push(action); }
      };

      this.submitDisabled = function() {
        var disabled = false;
        if (ctrl.viewedRule.name.length < 1) { disabled = true; }

        if (ctrl.viewedRule.conditions.length < 1) { disabled = true; }
        ctrl.viewedRule.conditions.map(function(condition) {
          if (!condition.param) { disabled = true; }
          if (!condition.regex.pattern) { disabled = true; }
        });

        if (ctrl.viewedRule.actions.length < 1) { disabled = true; }

        if (ctrl.viewedRule.options.edit.template) {
          var template = ctrl.viewedRule.options.edit.template;
          if (template.indexOf('{body}') < 0) { disabled = true; }
        }

        if (ctrl.viewedRule.options.edit.replace) {
          var pattern = ctrl.viewedRule.options.edit.replace.regex.pattern;
          var text = ctrl.viewedRule.options.edit.replace.text;
          if ((pattern && !text) || (!pattern && text)) { disabled = true; }
        }

        return disabled;
      };

      this.cleanRule = function(rule) {
        if (!rule.message) { delete rule.message; }
        if (!rule.options.ban_interval) { delete rule.options.ban_interval; }
        if (!rule.options.edit.template) { delete rule.options.edit.template; }

        if (rule.options.edit.replace) {
          if (!rule.options.edit.replace.text) { delete rule.options.edit.replace.text; }
          if (!rule.options.edit.replace.regex.pattern) { delete rule.options.edit.replace.regex; }
          if (!rule.options.edit.replace.text || !rule.options.edit.replace.regex) { delete rule.options.edit.replace; }
        }
        return rule;
      };

      this.getRules = function() {
        return AutoModeration.rules().$promise
        .then(function(data) { ctrl.rules = data; })
        .catch(function(err) {
          if (err.status === 403) { return; }
          else { Alert.error(err.data.message); }
        });
      };

      this.saveRule = function(rule) {
        // check type
        var type = 'add';
        if (rule.id) { type = 'edit'; }

        // clean rule
        rule = ctrl.cleanRule(rule);

        // save rule
        var promise;
        if (type === 'add') { promise = AutoModeration.addRule(rule).$promise; }
        else { promise = AutoModeration.editRule({ruleId: rule.id}, rule).$promise; }

        promise.then(function() { ctrl.viewable = false; })
        .then(function() {
          if (type === 'add') { Alert.success('Added Rule ' + rule.name); }
          else { Alert.success('Edited Rule ' + rule.name); }
        })
        .then(ctrl.getRules)
        .catch(function(err) { Alert.error(err.data.message); });
      };

      this.removeRule = function(rule) {
        return AutoModeration.removeRule({ruleId: rule.id}).$promise
        .then(function() { ctrl.deletable = false; })
        .then(function() { Alert.success('Deleted Rule ' + rule.name); })
        .then(ctrl.getRules)
        .catch(function(err) { Alert.error(err.data.message); });
      };

      this.getRules();
    }]
  };
}];


angular.module('ept').directive('autoModeration', directive);
