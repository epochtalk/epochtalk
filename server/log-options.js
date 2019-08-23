module.exports = {
  ops: {
      interval: 1000
  },
  reporters: {
    serverConsole: [
      {
        module: '@hapi/good-squeeze',
        name: 'Squeeze',
        args: [{ log: '*', response: '*', error: '*' }]
      },
      { module: '@hapi/good-console' },
      'stdout'
    ]
  }
};
