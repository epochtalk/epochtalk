var directive = ['Blacklist', 'Alert', 'Session', function(Blacklist, Alert, Session) {
  return {
    restrict: 'E',
    scope: true,
    template: require('./blacklist.directive.html'),
    controllerAs: 'vmBlacklist',
    controller: [function() {
      var ctrl = this;

      // Init
      this.blacklist;
      Blacklist.getBlacklist().$promise.then(function(blacklist) { ctrl.blacklist = blacklist; });

      // Permissions Handling
      this.hasPermission = function() {
        return Session.hasPermission('rank.upsert.allow') &&
          Session.hasPermission('rank.get.allow');
      };

      // Blacklist features
      this.ipRegex = /(^\s*(([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$)|(^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$)/;

      this.blockRegex = /^([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
      this.blockWildcardRegex = /^([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5]|\*)$/;

      this.selectedRule = null;

      this.showAddModal = false;
      this.saveRuleBtnLabel = 'Save';
      this.saveContinueBtnLabel = 'Save and Continue';
      this.addSubmitted = false;

      this.rule = { type: 0 };

      this.closeAdd = function(form) {
        if (!form) { ctrl.showAddModal = false;  }
        $timeout(function() {
          ctrl.addSubmitted = false;
          ctrl.rule = { type: 0 };
          ctrl.saveRuleBtnLabel = 'Save';
          ctrl.saveContinueBtnLabel = 'Save and Continue';
          if (form) { form.$setUntouched(); }
        }, 200);
      };

      var formatIPRule = function(rule) {
        var formattedRule = { id: rule.id, note: rule.note };

        if (rule.type === 0) { // single
          formattedRule.ip_data = rule.ip;
        }
        else if (rule.type === 1) { // range
          var ipv6Start = rule.start.indexOf(':') > -1;
          var ipv6End = rule.end.indexOf(':') > -1;
          var ipv4Start = rule.start.indexOf('.') > -1;
          var ipv4End = rule.end.indexOf('.') > -1;
          if ((ipv6Start && ipv4End) || (ipv4Start && ipv6End)) {
            Alert.error('Start and End address must both be either IPV4 or IPV6');
            rule.end = '';
            return;
          }
          formattedRule.ip_data = rule.start + '-' + rule.end;
        }
        else { // wildcard
          formattedRule.ip_data = rule.blockOne + '.' + rule.blockTwo + '.' +
            rule.blockThree + '.' + rule.blockFour;
        }
        return formattedRule;
      };

      this.addRule = function(form) {
        ctrl.addSubmitted = true;
        if (!form) { ctrl.saveRuleBtnLabel = 'Loading...'; }
        else { ctrl.saveContinueBtnLabel = 'Loading...'; }

        var ruleToAdd = formatIPRule(ctrl.rule);
        if (!ruleToAdd) {
          ctrl.addSubmitted = false;
          ctrl.saveRuleBtnLabel = 'Save';
          ctrl.saveContinueBtnLabel = 'Save and Continue';
          return;
        }

        Blacklist.addToBlacklist(ruleToAdd).$promise
        .then(function(updatedBlacklist) {
          ctrl.blacklist = updatedBlacklist;
          Alert.success('Successfully added rule named ' + ruleToAdd.note);
        })
        .catch(function() { Alert.error('There was an error adding the IP rule'); })
        .finally(function() { ctrl.closeAdd(form); });
      };

      this.showEditModal = false;
      this.editSubmitted = false;
      this.editRuleBtnLabel = 'Confirm Edit';
      this.selectedRule = null;

      this.closeEdit = function() {
        ctrl.showEditModal = false;
        $timeout(function() {
          ctrl.editSubmitted = false;
          ctrl.selectedRule = null;
          ctrl.editRuleBtnLabel = 'Save';
        }, 200);
      };

      this.openEditModal = function(rule) {
        var editRule = {
          id: rule.id,
          note: rule.note
        };
        if (rule.ip_data.indexOf('*') > -1) { // wildcard type 2
          var blocks = rule.ip_data.split('.');
          editRule.type = 2;
          editRule.blockOne = blocks[0];
          editRule.blockTwo = blocks[1];
          editRule.blockThree = blocks[2];
          editRule.blockFour = blocks[3];
        }
        else if (rule.ip_data.indexOf('-') > -1) { // range type 1
          editRule.type = 1;
          var range = rule.ip_data.split('-');
          editRule.start = range[0];
          editRule.end = range[1];
        }
        else { // standard ip
          editRule.type = 0;
          editRule.ip = rule.ip_data;
        }
        ctrl.selectedRule = editRule;
        ctrl.showEditModal = true;
      };

      this.editRule = function() {
        ctrl.editSubmitted = true;
        ctrl.editRuleBtnLabel = 'Loading...';

        var ruleToUpdate = formatIPRule(ctrl.selectedRule);
        if (!ruleToUpdate) {
          ctrl.editSubmitted = false;
          ctrl.editRuleBtnLabel = 'Confirm Edit';
          return;
        }

        Blacklist.updateBlacklist(ruleToUpdate).$promise
        .then(function(updatedBlacklist) {
          ctrl.blacklist = updatedBlacklist;
          Alert.success('Successfully edited rule named ' + ctrl.selectedRule.note);
        })
        .catch(function() { Alert.error('There was an error editing the IP rule'); })
        .finally(function() { ctrl.closeEdit(); });
      };

      this.showDeleteModal = false;
      this.deleteRuleBtnLabel = 'Confirm Delete';
      this.deleteSubmitted = false;

      this.closeDelete = function() {
        ctrl.showDeleteModal = false;
        $timeout(function() {
          ctrl.deleteRuleBtnLabel = 'Confirm Delete';
          ctrl.deleteSubmitted = false;
          ctrl.selectedRule = null;
        }, 200);
      };

      this.deleteRule = function(rule) {
        ctrl.deleteSubmitted = true;
        ctrl.deleteRuleBtnLabel = 'Loading...';

        Blacklist.deleteFromBlacklist({ id: rule.id }).$promise
        .then(function(updatedBlacklist) {
          ctrl.blacklist = updatedBlacklist;
          Alert.success('Successfully removed rule named ' + rule.note);
        })
        .catch(function() { Alert.error('There was an error removing the IP rule'); })
        .finally(function() { ctrl.closeDelete(); });
      };
    }]
  };
}];

angular.module('ept').directive('blacklist', directive);
