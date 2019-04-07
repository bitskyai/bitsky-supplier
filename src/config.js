/* eslint-disable no-process-env */
const constants = require('./util/constants');
// Env vars should be casted to correct types
const config = {
  PORT: Number(process.env.PORT) || constants.CONFIG.PORT,
  SERVICE_NAME: process.env.SERVICE_NAME || constants.CONFIG.SERVICE_NAME,
  NODE_ENV: process.env.NODE_ENV || constants.CONFIG.NODE_ENV,
  EACH_TIME_INTELLIGENCES_NUMBER: process.env.EACH_TIME_INTELLIGENCES_NUMBER || constants.CONFIG.EACH_TIME_INTELLIGENCES_NUMBER,
  LOG_FILES_PATH: process.env.LOG_FILES_PATH || constants.CONFIG.LOG_FILES_PATH,
  LOG_LEVEL: process.env.LOG_LEVEL || constants.CONFIG.LOG_LEVEL,
  DEBUG_MODE: process.env.DEBUG_MODE,
  MONGODB_URI: process.env.MONGODB_URI || constants.CONFIG.MONGODB_URI,
  DEFAULT_HEALTH_METHOD: process.env.DEFAULT_HEALTH_METHOD || constants.CONFIG.DEFAULT_HEALTH_METHOD,
  DEFAULT_HEALTH_PATH: process.env.DEFAULT_HEALTH_PATH || constants.CONFIG.DEFAULT_HEALTH_PATH,
  DEFAULT_INTELLIGENCES_METHOD: process.env.DEFAULT_INTELLIGENCES_METHOD || constants.CONFIG.DEFAULT_INTELLIGENCES_METHOD,
  DEFAULT_INTELLIGENCES_PATH: process.env.DEFAULT_INTELLIGENCES_PATH || constants.CONFIG.DEFAULT_INTELLIGENCES_PATH
};

module.exports = config;
