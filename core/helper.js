var _ = require('lodash');
var slugid = require('slugid');
var slugKeywords = [
  'id',
  'board_id',
  'thread_id',
  'post_id',
  'user_id',
  'reporter_id',
  'locked_by_id',
  'hidden_by_id',
  'mod_id',
  'author_id',
  'parent_id',
  'notification_id',
  'category_id',
  'last_thread_id',
  'last_post_id',
  'ignored_user_id',
  'reporter_user_id',
  'reviewer_user_id',
  'offender_user_id',
  'offender_post_id',
  'offender_message_id',
  'offender_thread_id',
  'offender_author_id',
  'user_id_trusted',
  'report_id',
  'status_id',
  'conversation_id',
  'sender_id',
  'receiver_id',
  'mentionee_id',
  'mentioner_id',
  'last_post_id',
  'latest_unread_post_id',
  'new_board_id',
  'old_board_id',
  'role_id'
];
var slugArrayKeywords = ['children_ids', 'board_ids', 'copied_ids', 'answer_ids', 'receiver_ids'];

module.exports = {
  intToUUID: function(id) {
    var hex = id.toString(16);
    var zeros = '00000000-0000-0000-0000-000000000000';
    var start = 36 - hex.length;
    return zeros.substring(0, start) + hex;
  },
  slugify: function(input) {
    return slugTransform(input, slugid.encode);
  },
  deslugify: function(input) {
    return slugTransform(input, slugid.decode);
  },
  /**
   * This function will check the latest copy for merging. If the
   * latest copy is undefined, it'll default to the original copy. If the
   * latest copy is an empty string, it'll set the dest property to null.
   * All other latest values will be copied over to the dest object.
   *
   * dest - destination object after merging
   * orginal - old user copy
   * latest - new user data
   * key - the object property to transfer over
   */
  updateAssign: function(dest, original, latest, key) {
    var value = latest[key];
    if (latest[key] === '') { value = null; }
    else if (latest[key] === undefined) { value = original[key]; }
    dest[key] = value;
  }
};


function slugTransform(input, slugMethod) {
  if (!input || input === '') { return undefined; }

  // concat everything into an array
  var isArray = false;
  if (_.isString(input)) {
    input = { isString: true, id: input };
  }
  if (_.isArray(input)) { isArray = true; }
  var inputs = [].concat(input);

  // (de)slugify each item in the array
  inputs.map(function(input) {
    // iterate over each object key
    _.keys(input).map(function(key) {
      if (!input[key]) { return input[key]; }

      // check if key is candidate for (de)slugification
      if (_.includes(slugKeywords, key)) {
        // (de)slugify
        input[key] = slugMethod(input[key]);
      }
      else if (_.includes(slugArrayKeywords, key)) {
        input[key] = input[key].map(function(item) { return slugMethod(item); });
      }
      else if (_.isPlainObject(input[key]) || _.isArray(input[key])) {
        input[key] = slugTransform(input[key], slugMethod);
      }
    });
  });

  // return single object/String or entire array
  if (isArray) { return inputs; }
  else if (inputs.length === 1 && inputs[0].isString) { return inputs[0].id; }
  else if (inputs.length === 1) { return inputs[0]; }
  else { return inputs; }
}
