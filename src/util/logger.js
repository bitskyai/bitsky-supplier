const { createLogger, format, transports } = require("winston");
const _ = require("lodash");
const { getConfig } = require("../config");
const fs = require("fs-extra");

// Only need one logger instance in whole system
let __logger;

function createMyLogger() {
  try {
    if (__logger) {
      // console.log('logger already created.');
      return __logger;
    }
    console.log('******getConfig("LOG_FILES_PATH"): ', getConfig("LOG_FILES_PATH"));
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
          filename: `${getConfig("LOG_FILES_PATH")}/error.log`,
          level: "error"
        }),
        new transports.File({
          filename: `${getConfig("LOG_FILES_PATH")}/${getConfig(
            "SERVICE_NAME"
          )}.log`
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
    console.log('error: ', err);
    return console;
  }
}

module.exports = createMyLogger();
