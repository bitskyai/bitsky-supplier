/**
 * Created by Shaoke Xu on 4/29/18.
 */

import "reflect-metadata";
const typeorm = require("typeorm");
const enableDestroy = require("server-destroy");

let dbConnection = null;
let server = null;
let processExit = false;

export async function startServer(customConfig) {
  try {
    // Why move all require inside startServer:
    // The reason is because when manually start server, if you required module before env variables were setting
    // it will have issue. So require all modules after envs set
    let { getConfig, overwriteConfig } = require("./config");
    if (customConfig) {
      overwriteConfig(customConfig);
    }
    const logger = require("./util/logger");
    const createApp = require("./app");
    require("./util/extendNativeJavaScript");
    const getDBConfiguration  = require("./util/dbConfiguration").default;
    logger.debug("startServer->config: ", getConfig());
    const dbConfig = getDBConfiguration();
    logger.debug(`dbConfig: %o `, dbConfig);
    dbConnection = await typeorm.createConnection(dbConfig);
    logger.debug("Create DB connection successfully.");

    const app = await createApp();
    if (server) {
      server.destroy();
    }
    server = app.listen(getConfig("PORT"), function() {
      console.log(
        `BitSky server listening on http://localhost:${getConfig("PORT")}/ in ${app.get("env")} mode`
      );
      logger.info(
        "BitSky server listening on http://localhost:%d/ in %s mode",
        getConfig("PORT"),
        app.get("env")
      );
    });

    enableDestroy(server);

    // Handle signals gracefully. Heroku will send SIGTERM before idle.
    process.on("SIGTERM", () => {
      logger.info(`SIGTERM received`);
      logger.info("Closing http.Server ..");
      // dbConnection.close();
      processExit = true;
      server.destroy();
    });
    process.on("SIGINT", () => {
      logger.info(`SIGINT(Ctrl-C) received`);
      logger.info("Closing http.Server ..");
      // dbConnection.close();
      processExit = true;
      server.destroy();
    });

    server.on("close", () => {
      logger.info("Engine Server closed");
      // process.emit("cleanup");

      logger.info("Giving 100ms time to cleanup..");
      // Give a small time frame to clean up
      if (processExit) {
        setTimeout(process.exit, 100);
      }
    });
  } catch (err) {
    throw err;
  }
}

export async function stopServer() {
  try {
    // close dabtabase connection
    dbConnection.close();
    // close server
    server.destroy();
  } catch (err) {
    throw err;
  }
}

export async function testDBConnection(dbConfig) {
  try {
    dbConfig.name = "testConnection";
    const connection = await typeorm.createConnection(dbConfig);
    connection.close();
    return true;
  } catch (err) {
    return false;
  }
}
