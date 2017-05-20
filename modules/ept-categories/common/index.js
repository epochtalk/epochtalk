var common = {};
module.exports = common;

function categoriesClean(sanitizer, payload) {
  payload.categories.map(function(cat) {
    cat.name = sanitizer.strip(cat.name);
  });
}

common.export = () =>  {
  return [
    {
      name: 'common.categories.clean',
      method: categoriesClean,
      options: { callback: false }
    }
  ];
};
