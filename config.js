var _ = require('lodash');
var setIfDefined = function(object, path, source) {
  if (!_.isUndefined(source)) {
    _.set(object, path, source);
  }
};

var coerceEnvBoolean = function(envBoolean) {
  if (envBoolean === 'true') {
    return true;
  }
  else if (envBoolean === 'false') {
    return false;
  }
  else {
    return undefined;
  }
};

var config = {
  host: process.env.HOST,
  port: process.env.PORT,
  publicUrl: process.env.PUBLIC_URL,
  privateKey: process.env.PRIVATE_KEY,
  inviteOnly: process.env.INVITE_ONLY === 'true' || false,
  postMaxLength: Number(process.env.POST_MAX_LENGTH) || 10000,
  saasMode: process.env.SAAS_MODE === 'true' || false,
  newbieEnabled: process.env.NEWBIE_ENABLED === 'true' || false,
  recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY,
  recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,
  gaKey: process.env.GA_KEY || 'UA-XXXXX-Y',
  googleAPIKey: process.env.GOOGLE_API_KEY,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleAppDomain: process.env.GOOGLE_APP_DOMAIN,
  disable_websocket_server: process.env.DISABLE_WEBSOCKET_SERVER === 'true' || false,
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

setIfDefined(config, 'emailerEnv.sender', process.env.EMAILER_SENDER);
setIfDefined(config, 'emailerEnv.transporter', process.env.EMAILER_TRANSPORTER);
setIfDefined(config, 'emailerEnv.options.ignoreTLS', process.env.EMAILER_OPTIONS_IGNORE_TLS);
setIfDefined(config, 'emailerEnv.options.host', process.env.EMAILER_OPTIONS_HOST);
setIfDefined(config, 'emailerEnv.options.port', process.env.EMAILER_OPTIONS_PORT);
setIfDefined(config, 'emailerEnv.options.auth.user', process.env.EMAILER_OPTIONS_AUTH_USER);
setIfDefined(config, 'emailerEnv.options.auth.pass', process.env.EMAILER_OPTIONS_AUTH_PASS);
setIfDefined(config, 'emailerEnv.options.secure', coerceEnvBoolean(process.env.EMAILER_OPTIONS_SECURE));
setIfDefined(config, 'emailerEnv.options.region', process.env.EMAILER_OPTIONS_REGION);
setIfDefined(config, 'emailerEnv.options.accessKeyId', process.env.EMAILER_OPTIONS_ACCESS_KEY_ID);
setIfDefined(config, 'emailerEnv.options.secretAccessKey', process.env.EMAILER_OPTIONS_SECRET_ACCESS_KEY);
setIfDefined(config, 'cors.origin', process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(' ') : undefined);

module.exports = config;
