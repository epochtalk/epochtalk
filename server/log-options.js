module.exports = {
  ops: {
      interval: 1000
  },
  reporters: {
    serverConsole: [
      {
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ log: '*', response: '*' }]
      },
      { module: 'good-console' },
      'stdout'
    ],
    serverOps: [
      {
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ ops: '*' }]
      },
      {
        module: 'good-squeeze',
        name: 'SafeJson'
      },
      {
        module: 'good-file',
        args: ['./logs/operations.log']
      }
    ],
    serverResponse: [
      {
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ response: '*' }]
      },
      {
        module: 'good-squeeze',
        name: 'SafeJson'
      },
      {
        module: 'good-file',
        args: ['./logs/response.log']
      }
    ],
    serverRequest: [
      {
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ request: '*' }]
      },
      {
        module: 'good-squeeze',
        name: 'SafeJson'
      },
      {
        module: 'good-file',
        args: ['./logs/request.log']
      }
    ],
    serverLog: [
      {
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ log: '*' }]
      },
      {
        module: 'good-squeeze',
        name: 'SafeJson'
      },
      {
        module: 'good-file',
        args: ['./logs/log.log']
      }
    ],
    serverError: [
      {
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ error: '*' }]
      },
      {
        module: 'good-squeeze',
        name: 'SafeJson'
      },
      {
        module: 'good-file',
        args: ['./logs/error.log']
      }
    ]
  }
};
