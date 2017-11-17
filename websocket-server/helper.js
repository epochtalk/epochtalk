var helper = module.exports = {};

helper.parseJSON = function(JSONThing) {
  try { return JSON.parse(JSONThing); }
  catch(err){ return undefined; }
};

helper.roleChannelLookup = function(channelRole) {
  return function(role) {
    return  channelRole === role.lookup;
  };
};
