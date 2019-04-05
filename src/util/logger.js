const {createLogger, format, transports} = require('winston');
const _ = require('lodash');
const config = require('../config');
const fs = require('fs-extra');

// Only need one logger instance in whole system
let __logger;

function createMyLogger() {
  if (__logger) {
    // console.log('logger already created.');
    return __logger;
  }
  fs.ensureDirSync(config.LOG_FILES_PATH);
  // console.log('[createLogger] starting...');
  __logger = createLogger({
    level: config.LOG_LEVEL,
    format: format.combine(
      format.ms(),
      format.errors({ stack: true }),
      format.timestamp(),
      format.splat(),
      format.json()
    ),
    defaultMeta: {
      service: config.SERVICE_NAME
    },
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log` 
      // - Write all logs error (and below) to `error.log`.
      //
      new transports.File({
        filename: `${config.LOG_FILES_PATH}/error.log`,
        level: 'error'
      }),
      new transports.File({
        filename: `${config.LOG_FILES_PATH}/${config.SERVICE_NAME}.log`
      })
    ]
  });
  //
  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  // 
  if (config.NODE_ENV !== 'production') {
    __logger.add(
      new transports.Console({
        colorize: config.NODE_ENV === 'development',
        timestamp: true,
      })
    );
  }

  // console.log('[createLogger] end');
  return __logger;
}

module.exports = createMyLogger();