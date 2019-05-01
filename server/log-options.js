module.exports = {
  ops: {
      interval: 1000
  },
  reporters: {
    serverConsole: [
      {
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ log: '*', response: '*', error: '*' }]
      },
      { module: 'good-console' },
      'stdout'
    ]
  }
};
