var _ = require('lodash');
var path = require('path');
var Boom = require('boom');
var db = require(path.normalize(__dirname + '/db'));

// anatomy of a rule
/*
 * Only works on posts
 * = Name: Name for this rule (for admin readability)
 * = Description: What this rule does (for admin readbility)
 * = Message: Error reported back to the user on reject action
 * = Conditions: condition regex will only work on
 *   - body
 *   - thread_id
 *   - user_id
 *   - title (although it's not much use)
 *   == REGEX IS AN OBJECT with a pattern and flag property
 *   Multiple conditions are allow but they all must pass to enable rule actions
 * = Actions: reject, ban, edit, delete (filter not yet implemented)
 * = Options:
 *   - banInterval:
 *      - Affects ban action.
 *      - Leave blank for permanent
 *      - Otherwise, JS date string
 *   - edit:
 *      - replace (replace chunks of text):
 *        - regex: Regex used to match post body
 *          - regex object has a pattern and flag property
 *        - text: Text used to replace any matches
 *      - template: String template used to add text above or below post body
*/
var rules = [];

// get rules from db
(function loadRules() {
  return db.rules()
  .then(function(rows) { rules = rules.concat(rows); });
})();

function addRule(rule) {
  rules.push(rule);
}

function editRule(rule) {
  // find rule
  var index = _.findIndex(rules, function(memRule) { return memRule.id === rule.id; });
  var memRule = rules[index];

  // update rule
  memRule.name = rule.name;
  memRule.description = rule.description;
  memRule.message = rule.message;
  memRule.conditions = rule.conditions;
  memRule.actions = rule.actions;
  memRule.options = rule.options;
}

function removeRule(ruleId) {
  _.remove(rules, function(memRule) { return memRule.id === ruleId; });
}

// main api endpoint
function moderate(request) {
  var actionSet = new Set();
  var aggMessages = [];
  var banInterval, aggEdits = [];
  var post = request.payload;
  post.user_id = request.auth.credentials.id;

  rules.map(function(rule) {
    if (examineConditions(post, rule.conditions)) {
      // aggregate all actions
      rule.actions.map(function(action) { actionSet.add(action); });

      // aggregate all reject messages, if applicable
      if ((rule.actions.indexOf('reject') > -1) && rule.message) {
        aggMessages.push(rule.message);
      }

      // pick the latest ban interval
      if (rule.actions.indexOf('ban') > -1) {
        var interval = _.get(rule, 'options.ban_interval');
        if (!banInterval) { banInterval = interval; }
        else if (banInterval) { banInterval = interval > banInterval ? interval : banInterval; }
      }

      // aggregate all edit options
      if (rule.actions.indexOf('edit') > -1) {
        var edits = _.get(rule, 'options.edit');
        if (edits) { aggEdits.push(edits); }
      }
    }
  });

  return executeActions(request, actionSet, aggMessages, banInterval, aggEdits);
}

function examineConditions(post, conditionsArray) {
  var conditionsPass = false;

  // test each condition
  // returns an array of booleans (true if condition passes)
  var testedConds = conditionsArray.map(function(condition) {
    var param = post[condition.param];
    var regex = new RegExp(condition.regex.pattern, condition.regex.flags);

    // test regex against the post param
    return regex.test(param);
  });

  // check that all conditions passed
  // return all false booleans
  var failedConds = testedConds.filter(function(conditionResult) {
    return conditionResult === false;
  });

  // return true if all conditions pass
  // true if length is zero
  if (failedConds.length === 0) { conditionsPass = true; }

  return conditionsPass;
}

function executeActions(request, actionSet, messages, banInterval, edits) {
  if (actionSet.size === 0) { return; }

  // handle edit first
  if (actionSet.has('edit')) {
    edits.forEach(function(edit) {
      var editOutput = request.payload.body;

      if (edit.replace) {
        var regex = new RegExp(edit.replace.regex.pattern, edit.replace.regex.flags);
        var text = edit.replace.text;
        editOutput = editOutput.replace(regex, text);
      }

      if (edit.template) {
        var template = edit.template;
        editOutput = template.replace('{body}', editOutput);
      }

      request.payload.body = editOutput;
    });
  }

  // handle ban
  if (actionSet.has('ban')) {
    var banPeriod;
    var userId = request.auth.credentials.id;
    if (banInterval) {
      banPeriod = new Date();
      banPeriod.setDate(banPeriod.getDate() + banInterval);
    }
    request.db.bans.ban(userId, banPeriod)
    .then(function(user) {
      return request.session.updateRoles(user.user_id, user.roles)
      .then(function() { return request.session.updateBanInfo(user.user_id, user.expiration); });
    });
  }

  // handle shadow delete
  if (actionSet.has('delete')) {
    request.payload.deleted = true;
    request.payload.locked = true;
  }

  // handle reject last
  // must be last because it'll need to return a Boom error
  if (actionSet.has('reject')) {
    return Boom.badRequest(messages.join(' -- '));
  }
}

module.exports = {
  moderate: moderate,
  addRule: addRule,
  editRule: editRule,
  removeRule: removeRule
};
