const path = require("path");
// import config from "./config";
const constants = require("./constants");
const { getConfig } = require("../config");

export default function getDBConfiguration() {
  let configuration: any;
  // Default use sqlite
  if (!getConfig('TYPEORM_CONNECTION')) {
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
      type: getConfig('TYPEORM_CONNECTION'),
      synchronize: true
    };

    let dbType = "sql";

    configuration = { ...constants.DEFAULT_DB_CONFIG, ...configuration };

    if (configuration.type == constants.DEFAULT_SQLITE.type) {
      configuration.database = getConfig('TYPEORM_DATABASE');
      configuration.entities = [
        path.join(__dirname, "../entity/**/*.common.js"),
        path.join(__dirname, "../entity/**/*.sql.js"),
        path.join(__dirname, "../entity/**/*.sqlite.js")
      ];
    } else if (configuration.type == constants.DEFAULT_MONGODB.type) {
      dbType = "nosql";
      // https://typeorm.io/#/connection-options/mongodb-connection-options
      configuration.url = getConfig('TYPEORM_URL');
      // Following set will overwrite parameters set from URL
      if (getConfig('TYPEORM_HOST')) {
        configuration.host = getConfig('TYPEORM_HOST');
      }

      if (getConfig('TYPEORM_PORT')) {
        configuration.port = getConfig('TYPEORM_PORT');
      }

      if (getConfig('TYPEORM_DATABASE')) {
        configuration.database = getConfig('TYPEORM_DATABASE');
      }

      configuration.useNewUrlParser = true;
      configuration.useUnifiedTopology = true;

      configuration.entities = [
        path.join(__dirname, "../entity/**/*.common.js"),
        path.join(__dirname, `../entity/**/*.${dbType}.js`),
        path.join(__dirname, `../entity/**/*.${configuration.type}.js`)
      ];
    }
  }

  return configuration;
}

export function getDBType() {
  return getConfig('TYPEORM_CONNECTION') || constants.DEFAULT_SQLITE.type;
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
