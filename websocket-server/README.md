Epochtalk Websocket Server
=======================

Socket server for epochtalk notifications.

Configuration
-------------

```bash
cp example.env .env
```

### EpochTalk

```bash
WEBSOCKET_BIND_ADDRESS # specify the host to listen on
WEBSOCKET_PORT    # specify the port to expose
WEBSOCKET_API_KEY # used to validate the Epochtalk server
PRIVATE_KEY       # to reflect that of the Epochtalk server.
                  # used for JWT token authentication.
```

### Postgres

```bash
DATABASE_URL # the URL for the postgres instance
```

### Redis

Websocket-server uses Redis to keep track of users who are currently online.  To
set up a connection to Redis, provide the following variables in `.env`.

```bash
REDIS_HOST # the redis host to connect to
REDIS_PORT # the redis port to connect to
WEBSOCKET_REDIS_DB   # the number of the redis db
```

### SSL

If you would like to use SSL, enable it by setting `WEBSOCKET_PROTOCOL=https`.
You will also need to provide:

 * A key at `keys/WEBSOCKET_KEY_NAME`

 * A cert at `keys/WEBSOCKET_CERT_NAME`

You may provide an *optional* `WEBSOCKET_KEY_NAME` and `WEBSOCKET_CERT_NAME`.
If you do not provide them, defaults are:

  * `WEBSOCKET_KEY_NAME=server.key`

  * `WEBSOCKET_CERT_NAME=server.crt`

Full options:

```bash
WEBSOCKET_PROTOCOL  # http or https
WEBSOCKET_KEY_NAME  # corresponds to the file name of the key
WEBSOCKET_CERT_NAME # corresponds to the file name of the cert
WEBSOCKET_PASS      # the passphrase for the ssl private key
```

### Engine

You can specify [uws](https://www.npmjs.com/package/uws) as the engine

```bash
WEBSOCKET_ENGINE # ws (default) or uws
```



Running
-------

```
npm install

npm run serve
```
