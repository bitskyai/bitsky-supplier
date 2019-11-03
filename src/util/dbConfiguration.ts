const path = require("path");
// import config from "./config";
const constants = require("./constants");

export default function getDBConfiguration() {
  let configuration: any;
  // Default use sqlite
  if (!process.env.TYPEORM_CONNECTION) {
    configuration = {
      ...constants.DEFAULT_DB_CONFIG,
      ...constants.DEFAULT_SQLITE
    };
    configuration.entities = [
      path.join(__dirname, "../entity/**/*.common.js"),
      path.join(__dirname, "../entity/**/*.sql.js"),
      path.join(__dirname, "../entity/**/*.sqlite.js")
    ];
  } else {
    // This is a common configuration
    configuration = {
      type: process.env.TYPEORM_CONNECTION,
      synchronize: true
    };

    let dbType = "sql";

    configuration = { ...constants.DEFAULT_DB_CONFIG, ...configuration };

    if (configuration.type == constants.DEFAULT_SQLITE.type) {
      configuration.database =
        process.env.TYPEORM_DATABASE || constants.DEFAULT_SQLITE.database;
    } else if (configuration.type == constants.DEFAULT_MONGODB.type) {
      dbType = "nosql";
      // https://typeorm.io/#/connection-options/mongodb-connection-options
      configuration.url =
        process.env.TYPEORM_URL || constants.DEFAULT_MONGODB.url;
      // Following set will overwrite parameters set from URL
      if (process.env.TYPEORM_HOST) {
        configuration.host = process.env.TYPEORM_HOST;
      }

      if (process.env.TYPEORM_PORT) {
        configuration.port = process.env.TYPEORM_PORT;
      }

      if (process.env.TYPEORM_DATABASE) {
        configuration.database = process.env.TYPEORM_DATABASE;
      }

      configuration.entities = [
        path.join(__dirname, "./entity/**/*.common.js"),
        path.join(__dirname, `./entity/**/*.${dbType}.js`),
        path.join(__dirname, `./entity/**/*.${configuration.type}.js`)
      ];
    }
  }

  return configuration;
}

export function getDBType() {
  return process.env.TYPEORM_CONNECTION || constants.DEFAULT_SQLITE.type;
}

export function isMongo() {
  if (getDBType() === constants.DEFAULT_MONGODB.type) {
    return true;
  }

  return false;
}

export function isSQLite() {
  if (getDBType() === constants.DEFAULT_SQLITE.type) {
    return true;
  }

  return false;
}
