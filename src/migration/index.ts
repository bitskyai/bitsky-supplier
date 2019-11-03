const _ = require("lodash");
const packageJSON = require("../../package.json");
const { find, insertOne, updateOne } = require("../util/db");
const { COLLECTIONS_NAME } = require("../util/constants");
const logger = require("../util/logger");
// const ServerInformation = require("../data_models/ServerInformation");
import ServerInformation from "../entity/ServerInformation";
const migration1 = require("./migration1");

import {
  getServerInfo,
  addServerInfo,
  updateServerInfo
} from "../dbController/ServerInformationCtr";

// TODO: Use memory cache, like **memcached**. Cache system info in memory, since currently we only have master node, so it should be ok in memory.
// instance of ServerInformation
let _server_info = undefined;
// whether has a migration job is running, don't duplicate run migration
let _migration_running = false;
/* 
    **Migration Design:**
    Only allow migration from one version to next version, don't allow one migration move several versions. 
    For example, Server version is 1.1.0, Migration Version is 4, and currently database server version is 0.9.10, Migration Version is 2,
    so it need first migrate to 3, then migrate to 4. Migration Version don't have 1 o 1 relative with Serve Version, not every server update
    need to do data migration
 */
async function migration() {
  try {
    if (_migration_running) {
      logger.info(
        "Already has a migration job running, please waiting previous job finish! if it take too long, then you can try to restart server"
      );
      return;
    }
    logger.info("Working on ...");
    let nextMigrationVersion = _server_info.migration_version + 1;
    switch (nextMigrationVersion) {
      case 1:
        // a migration job is running
        _migration_running = true;
        logger.info(
          "============================================================"
        );
        logger.info(
          `[[Start migrate to migrationVersion ${nextMigrationVersion}`
        );

        // TODO: add your migrate task
        await migration1.migrateTask();

        logger.info(`[[[Start update Server Information`);
        // let serverInfo = await find(COLLECTIONS_NAME.serverInfo, {});
        // serverInfo = serverInfo && serverInfo[0];
        // let info = new ServerInformation();
        // info.deserialize(serverInfo);
        // info.migrationVersion = 1;
        // _server_info = info;
        // let doc = info.serialize();
        // logger.info(`[[[Update Server Information]]]`, {
        //     data: doc
        // });
        // await updateOne(COLLECTIONS_NAME.serverInfo, {
        //     _id: {
        //         $eq: serverInfo._id
        //     }
        // }, {
        //     $set: doc
        // });

        let info: any = await getServerInfo();
        info.migration_version = 1;
        _server_info = info;
        await updateServerInfo(info.global_id, { migration_version: 1 });
        logger.info(`End update Server Information]]]`);
        logger.info(
          `End migrate to migrationVersion ${nextMigrationVersion}]]`
        );
        logger.info(
          "============================================================"
        );
        // migration job finished
        _migration_running = false;
        break;
      default:
        break;
    }
  } catch (err) {
    throw err;
  }
}

// check whether need to do migration
async function checkMigration(req, res, next) {
  try {
    logger.debug(`[checkMigration] Starting, _server_info: %o`, _server_info);
    // didn't cache, need to get system information from server
    if (!_server_info) {
      // Get all server inform
      // let serverInfo = await find(COLLECTIONS_NAME.serverInfo, {});
      // _server_info = serverInfo && serverInfo[0];
      // if doesn't exist, then init server information
      logger.debug('[checkMigration], start getServerInfo');
      _server_info = await getServerInfo();
      logger.debug('[checkMigration] _server_info: %o', _server_info);
      if (!_server_info || !_server_info.global_id) {
        logger.debug(
          `[checkMigration] *_server_info* doesn't exist in DB, init a serverInfo and insert to DB, collection name: ${COLLECTIONS_NAME.serverInfo}.`
        );
        // let info = new ServerInformation();
        // info.name = packageJSON.name;
        // info.description = packageJSON.description;
        // info.version = packageJSON.version;
        // info.migrationVersion = 0;
        // _server_info = info;
        // await insertOne(COLLECTIONS_NAME.serverInfo, info.serialize());
        _server_info = await addServerInfo(
          packageJSON.name,
          packageJSON.description,
          packageJSON.version,
          0
        );
      } else {
        logger.debug("[checkMigration] Get *_server_info* from DB.", {
          serverInfo: _server_info
        });
      }
    }

    // if migrationVersion in DB is small then running server's migrationVersion
    // then need to do data migration
    if (_server_info.migration_version < packageJSON.migrationVersion) {
      // migration can working in the background
      migration();
      // let user know currently server is during maintenance time
      if (res) {
        res
          .status(503)
          .send("<p>Server is on maintenance. please try it later</p>")
          .end();
      } else {
        logger.info("checkMigration wasn't triggered by RESTFul API");
      }
    } else {
      // don't need to do anything, running server is good with database
      if (next) {
        next();
      } else {
        logger.info("checkMigration wasn't triggered by RESTFul API");
      }
    }
  } catch (err) {
    if (next) {
      next(err);
    } else {
      logger.info("checkMigration wasn't triggered by RESTFul API");
    }
  }
}

module.exports = checkMigration;
