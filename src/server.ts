/**
 * Created by Shaoke Xu on 4/29/18.
 */
require("./util/extendNativeJavaScript");
import "reflect-metadata";
const typeorm = require("typeorm");
const enableDestroy = require("server-destroy");
let { getConfig, overwriteConfig } = require("./config");
const createApp = require("./app");
import getDBConfiguration from "./util/dbConfiguration";

export async function startServer(customConfig) {
  try {
    if (customConfig) {
      overwriteConfig(customConfig);
    }
    const logger = require("./util/logger");
    logger.debug("startServer->config: ", getConfig());
    const dbConfig = getDBConfiguration();
    logger.debug(`dbConfig: %o `, dbConfig);
    logger.debug(`typeorm: `, typeorm);
    let connection = await typeorm.createConnection(dbConfig);
    logger.debug("Create DB connection successfully.");

    const app = await createApp();
    const server = app.listen(getConfig('PORT'), function() {
      logger.info(
        "Express server listening on http://localhost:%d/ in %s mode",
        getConfig('PORT'),
        app.get("env")
      );
    });

    enableDestroy(server);

    // Handle signals gracefully. Heroku will send SIGTERM before idle.
    process.on("SIGTERM", () => {
      logger.info(`SIGTERM received`);
      logger.info("Closing http.Server ..");
      server.destroy();
    });
    process.on("SIGINT", () => {
      logger.info(`SIGINT(Ctrl-C) received`);
      logger.info("Closing http.Server ..");
      server.destroy();
    });

    server.on("close", () => {
      logger.info("Server closed");
      // process.emit("cleanup");

      logger.info("Giving 100ms time to cleanup..");
      // Give a small time frame to clean up
      setTimeout(process.exit, 100);
    });
  } catch (err) {
    throw err;
  }
}
