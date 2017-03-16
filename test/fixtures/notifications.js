var path = require('path');
var fake = require(path.join(__dirname, '..', 'seed', 'fake'));

// self-reference using a string
// ex: 'users.0'
module.exports = {
  run: [
    'users',
    'notifications'
  ],
  methods: {
    users: fake.users,
    notifications: fake.notifications
  },
  data: {
    users: [
      {},
      {},
      {},
      {}
    ],
    notifications: [
      { receiver_id: 'users.0.id', sender_id: 'users.0.id', type: 'message' },
      { receiver_id: 'users.0.id', sender_id: 'users.1.id', type: 'message' },
      { receiver_id: 'users.0.id', sender_id: 'users.2.id', type: 'message' },
      { receiver_id: 'users.0.id', sender_id: 'users.0.id', type: 'message' },
      { receiver_id: 'users.0.id', sender_id: 'users.1.id', type: 'message' },
      { receiver_id: 'users.0.id', sender_id: 'users.2.id', type: 'message' },
      { receiver_id: 'users.0.id', sender_id: 'users.0.id', type: 'message' },
      { receiver_id: 'users.0.id', sender_id: 'users.1.id', type: 'message' },
      { receiver_id: 'users.0.id', sender_id: 'users.2.id', type: 'message' },
      { receiver_id: 'users.0.id', sender_id: 'users.0.id', type: 'message' },
      { receiver_id: 'users.0.id', sender_id: 'users.1.id', type: 'message' },
      { receiver_id: 'users.0.id', sender_id: 'users.2.id', type: 'message' },
      { receiver_id: 'users.0.id', sender_id: 'users.0.id', type: 'message' },
      { receiver_id: 'users.0.id', sender_id: 'users.1.id', type: 'message' },
      { receiver_id: 'users.0.id', sender_id: 'users.2.id', type: 'message' },
      { receiver_id: 'users.0.id', sender_id: 'users.0.id', type: 'message' },
      { receiver_id: 'users.0.id', sender_id: 'users.1.id', type: 'message' },
      { receiver_id: 'users.0.id', sender_id: 'users.2.id', type: 'message' },
      { receiver_id: 'users.0.id', sender_id: 'users.0.id', type: 'mention' },
      { receiver_id: 'users.0.id', sender_id: 'users.1.id', type: 'mention' },
      { receiver_id: 'users.0.id', sender_id: 'users.2.id', type: 'mention' },
      { receiver_id: 'users.0.id', sender_id: 'users.0.id', type: 'mention' },
      { receiver_id: 'users.0.id', sender_id: 'users.1.id', type: 'mention' },
      { receiver_id: 'users.0.id', sender_id: 'users.2.id', type: 'mention' },
      { receiver_id: 'users.0.id', sender_id: 'users.0.id', type: 'mention' },
      { receiver_id: 'users.0.id', sender_id: 'users.1.id', type: 'mention' },
      { receiver_id: 'users.0.id', sender_id: 'users.2.id', type: 'mention' },
      { receiver_id: 'users.0.id', sender_id: 'users.0.id', type: 'mention' },
      { receiver_id: 'users.0.id', sender_id: 'users.1.id', type: 'mention' },
      { receiver_id: 'users.0.id', sender_id: 'users.2.id', type: 'mention' },
      { receiver_id: 'users.0.id', sender_id: 'users.0.id', type: 'mention' },
      { receiver_id: 'users.0.id', sender_id: 'users.1.id', type: 'mention' },
      { receiver_id: 'users.0.id', sender_id: 'users.2.id', type: 'mention' },
      { receiver_id: 'users.0.id', sender_id: 'users.0.id', type: 'mention' },
      { receiver_id: 'users.0.id', sender_id: 'users.1.id', type: 'mention' },
      { receiver_id: 'users.0.id', sender_id: 'users.2.id', type: 'mention' },
      { receiver_id: 'users.1.id', sender_id: 'users.0.id', type: 'message' },
      { receiver_id: 'users.1.id', sender_id: 'users.1.id', type: 'message' },
      { receiver_id: 'users.1.id', sender_id: 'users.2.id', type: 'message' },
      { receiver_id: 'users.1.id', sender_id: 'users.0.id', type: 'message' },
      { receiver_id: 'users.1.id', sender_id: 'users.1.id', type: 'message' },
      { receiver_id: 'users.1.id', sender_id: 'users.2.id', type: 'message' },
      { receiver_id: 'users.1.id', sender_id: 'users.0.id', type: 'message' },
      { receiver_id: 'users.1.id', sender_id: 'users.1.id', type: 'message' },
      { receiver_id: 'users.1.id', sender_id: 'users.2.id', type: 'message' },
      { receiver_id: 'users.1.id', sender_id: 'users.0.id', type: 'message' },
      { receiver_id: 'users.1.id', sender_id: 'users.1.id', type: 'message' },
      { receiver_id: 'users.2.id', sender_id: 'users.0.id', type: 'message' },
      { receiver_id: 'users.2.id', sender_id: 'users.1.id', type: 'message' },
      { receiver_id: 'users.2.id', sender_id: 'users.2.id', type: 'message' },
      { receiver_id: 'users.2.id', sender_id: 'users.0.id', type: 'mention' },
      { receiver_id: 'users.2.id', sender_id: 'users.1.id', type: 'mention' },
      { receiver_id: 'users.2.id', sender_id: 'users.2.id', type: 'mention' },
      { receiver_id: 'users.3.id', sender_id: 'users.0.id', type: 'message' },
      { receiver_id: 'users.3.id', sender_id: 'users.1.id', type: 'message' }
    ]
  }
};
