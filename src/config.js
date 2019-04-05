/* eslint-disable no-process-env */
const constants = require('./util/constants');
// Env vars should be casted to correct types
const config = {
  PORT: Number(process.env.PORT) || constants.CONFIG.PORT,
  SERVICE_NAME: process.env.SERVICE_NAME || constants.CONFIG.SERVICE_NAME,
  NODE_ENV: process.env.NODE_ENV || constants.CONFIG.NODE_ENV,
  LOG_FILES_PATH: process.env.LOG_FILES_PATH || constants.CONFIG.LOG_FILES_PATH,
  LOG_LEVEL: process.env.LOG_LEVEL || constants.CONFIG.LOG_LEVEL,
  DEBUG_MODE: process.env.DEBUG_MODE,
  MONGODB_URI: process.env.MONGODB_URI || constants.CONFIG.MONGODB_URI,
  MONGODB_URL: process.env.MONGODB_URL || constants.CONFIG.MONGODB_URL,
  MONGODB_NAME: process.env.MONGODB_NAME || constants.CONFIG.MONGODB_NAME,
  MONGODB_USERNAME: process.env.MONGODB_USERNAME,
  MONGODB_PASSWORD: process.env.MONGODB_PASSWORD
};

module.exports = config;
