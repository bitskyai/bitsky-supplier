const { createLogger, format, transports } = require("winston");
const _ = require("lodash");
const { getConfig } = require("../config");
const { CONFIG } = require('./constants');
const fs = require("fs-extra");

// Only need one logger instance in whole system
let __logger;

function createMyLogger() {
  try {
    if (__logger) {
      // console.log('logger already created.');
      return __logger;
    }
    fs.ensureDirSync(getConfig("LOG_FILES_PATH"));
    // console.log('[createLogger] starting...');
    __logger = createLogger({
      level: getConfig("LOG_LEVEL"),
      format: format.combine(
        format.ms(),
        format.errors({ stack: true }),
        format.timestamp(),
        format.splat(),
        format.json()
      ),
      defaultMeta: {
        service: getConfig("SERVICE_NAME")
      },
      transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new transports.File({
          filename: `${getConfig("LOG_FILES_PATH")}/${CONFIG.ERROR_LOG_FILE_NAME}`,
          level: "error",
          tailable: true,
          maxsize: getConfig('LOG_MAX_SIZE'),
          maxFiles: 1
        }),
        new transports.File({
          filename: `${getConfig("LOG_FILES_PATH")}/${CONFIG.COMBINED_LOG_FILE_NAME}`,
          tailable: true,
          maxsize: getConfig('LOG_MAX_SIZE'),
          maxFiles: 1
        })
      ]
    });
    //
    // If we're not in production then log to the `console` with the format:
    // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
    //
    if (getConfig("NODE_ENV") !== "production") {
      __logger.add(
        new transports.Console({
          colorize: getConfig("NODE_ENV") === "development",
          timestamp: true
        })
      );
    }

    // console.log('[createLogger] end');
    return __logger;
  } catch (err) {
    console.error('error: ', err);
    return console;
  }
}

module.exports = createMyLogger();
