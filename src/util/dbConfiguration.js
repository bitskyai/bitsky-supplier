const constants = require("./constants");
function getDBConfiguration() {
  /*
        TYPEORM_CONNECTION = mysql
        TYPEORM_HOST = localhost
        TYPEORM_USERNAME = root
        TYPEORM_PASSWORD = admin
        TYPEORM_DATABASE = test
        TYPEORM_PORT = 3000
        TYPEORM_SYNCHRONIZE = true
     */
  // Default use sqlite
  if (!process.env.TYPEORM_CONNECTION) {
    return constants.DEFAULT_SQLITE;
  } else {
    // This is a common configuration
    let configuration = {
      type: process.env.TYPEORM_CONNECTION,
      synchronize: true
    };

    if(configuration.type == constants.DEFAULT_SQLITE.type){
        configuration.database = process.env.TYPEORM_DATABASE || constants.DEFAULT_SQLITE.database;
    }else if(configuration.type == constants.DEFAULT_MONGODB.type){
        // https://typeorm.io/#/connection-options/mongodb-connection-options
        configuration.url = process.env.TYPEORM_URL || constants.DEFAULT_MONGODB.url;
        // Following set will overwrite parameters set from URL
        if(process.env.TYPEORM_HOST){
            configuration.host = process.env.TYPEORM_HOST;
        }

        if(process.env.TYPEORM_PORT){
            configuration.port = process.env.TYPEORM_PORT;
        }

        if(process.env.TYPEORM_DATABASE){
            configuration.database = process.env.TYPEORM_DATABASE;
        }
    }

    return configuration;
  }
}

module.exports = getDBConfiguration;
