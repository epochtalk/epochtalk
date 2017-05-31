var _ = require('lodash');
var setIfDefined = function(object, path, source) {
  if (!_.isUndefined(source)) {
    _.set(object, path, source);
  }
};

var config = {
  host: process.env.HOST,
  port: process.env.PORT,
  publicUrl: process.env.PUBLIC_URL,
  privateKey: process.env.PRIVATE_KEY,
  inviteOnly: process.env.INVITE_ONLY === 'true' || false,
  saasMode: process.env.SAAS_MODE === 'true' || false,
  recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
  recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,
  gaKey: process.env.GA_KEY || 'UA-XXXXX-Y',
  websocket_host: process.env.WEBSOCKET_HOST,
  websocket_client_host: process.env.WEBSOCKET_CLIENT_HOST,
  websocket_port: process.env.WEBSOCKET_PORT,
  websocketAPIKey: process.env.WEBSOCKET_API_KEY,
  websocketSecure: process.env.WEBSOCKET_SECURE === 'true',
  rateLimitingEnv: {
    get: {
      interval: process.env.RATE_LIMITING_GET_INTERVAL || undefined,
      maxInInterval: process.env.RATE_LIMITING_GET_MAX_IN_INTERVAL || undefined,
      minDifference: process.env.RATE_LIMITING_GET_MIN_DIFFERENCE || undefined
    },
    post: {
      interval: process.env.RATE_LIMITING_POST_INTERVAL || undefined,
      maxInInterval: process.env.RATE_LIMITING_POST_MAX_IN_INTERVAL || undefined,
      minDifference: process.env.RATE_LIMITING_POST_MIN_DIFFERENCE || undefined
    },
    put: {
      interval: process.env.RATE_LIMITING_PUT_INTERVAL || undefined,
      maxInInterval: process.env.RATE_LIMITING_PUT_MAX_IN_INTERVAL || undefined,
      minDifference: process.env.RATE_LIMITING_PUT_MIN_DIFFERENCE || undefined
    },
    delete: {
      interval: process.env.RATE_LIMITING_DELETE_INTERVAL || undefined,
      maxInInterval: process.env.RATE_LIMITING_DELETE_MAX_IN_INTERVAL || undefined,
      minDifference: process.env.RATE_LIMITING_DELETE_MIN_DIFFERENCE || undefined
    }
  },
  imagesEnv: {
    storage: process.env.IMAGES_STORAGE,
    maxSize: process.env.IMAGES_MAX_SIZE,
    expiration: process.env.IMAGES_EXPIRATION,
    interval: process.env.IMAGES_INTERVAL,
    s3: {
      root: process.env.IMAGES_S3_ROOT,
      dir: process.env.IMAGES_S3_DIR,
      bucket: process.env.IMAGES_S3_BUCKET,
      region: process.env.IMAGES_S3_REGION,
      accessKey: process.env.IMAGES_S3_ACCESS_KEY,
      secretKey: process.env.IMAGES_S3_SECRET_KEY
    }
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    options: {
      auth_pass:  process.env.REDIS_AUTH_PASS || null
    }
  },
  portal: {
    enabled: process.env.PORTAL_ENABLED === 'true' || false,
    boardId: process.env.PORTAL_BOARD_ID || ''
  }
};

setIfDefined(config, 'emailer.sender', process.env.EMAILER_SENDER);
setIfDefined(config, 'emailer.transporter', process.env.EMAILER_TRANSPORTER);
setIfDefined(config, 'emailer.options.ignoreTLS', process.env.EMAILER_OPTIONS_IGNORE_TLS);
setIfDefined(config, 'emailer.options.host', process.env.EMAILER_OPTIONS_HOST);
setIfDefined(config, 'emailer.options.port', process.env.EMAILER_OPTIONS_PORT);
setIfDefined(config, 'emailer.options.auth.user', process.env.EMAILER_OPTIONS_AUTH_USER);
setIfDefined(config, 'emailer.options.auth.pass', process.env.EMAILER_OPTIONS_AUTH_PASS);
setIfDefined(config, 'emailer.options.secure', process.env.EMAILER_OPTIONS_SECURE === 'true' || undefined);
setIfDefined(config, 'emailer.options.ses.region', process.env.EMAILER_OPTIONS_SES_REGION);
setIfDefined(config, 'emailer.options.ses.accessKey', process.env.EMAILER_OPTIONS_SES_ACCESS_KEY);
setIfDefined(config, 'emailer.options.ses.secretKey', process.env.EMAILER_OPTIONS_SES_SECRET_KEY);

module.exports = config;
