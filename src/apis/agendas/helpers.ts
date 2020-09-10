import * as _ from "lodash";
import { LessThan } from "typeorm";
const { getConfig } = require("../../config");
const logger = require("../../util/logger");
const { TASK_STATE } = require("../../util/constants");
const { HTTPError } = require("../../util/error");
import { updateTasksStateForManagementDB } from "../../dbController/TaskAndHistory.ctrl";
import { removeTimeoutJob } from "../../dbController/TasksJobQueue.ctrl";
import { getNeedCheckHealthRetailersDB } from "../../dbController/Retailer.ctrl";
const { updateRetailerState } = require("../retailers/helpers");

/**
 * Update all
 */
export async function updateTimeoutTasks(securityKey?) {
  try {
    const taskTimeout = getConfig("TIMEOUT_VALUE_FOR_TASK");
    const startedAt = Date.now() - taskTimeout;
    logger.info(`Update tasks if they are timeout`, {
      function: "updateTimeoutTasks",
      taskTimeout,
      startedAt,
      securityKey,
    });
    await updateTasksStateForManagementDB(
      TASK_STATE.timeout,
      null,
      null,
      null,
      startedAt,
      securityKey,
      true
    );
  } catch (err) {
    if (!(err instanceof HTTPError)) {
      // if it isn't HTTPError instance
      err = new HTTPError(500, err);
    }
    logger.error(
      `Update tasks if they are timeout fail. Error: ${err.message}`,
      { error: err, function: "updateTimeoutTasks" }
    );
    throw err;
  }
}

export async function checkRetailerServicesHealth(securityKey?) {
  try {
    const intervalCheckAS = getConfig("RETAILER_STATE_CHECK_TIME");
    const lastPing = Date.now() - intervalCheckAS;
    const retailerServices = await getNeedCheckHealthRetailersDB(
      lastPing,
      securityKey
    );
    logger.info(`Check Retailer Service Health`, {
      function: "checkRetailerServicesHealth",
      intervalCheckAS,
      lastPing,
      retailerServices: retailerServices.length,
    });
    for (let i = 0; i < retailerServices.length; i++) {
      await updateRetailerState(retailerServices[i].globalId, retailerServices[i], true);
    }
  } catch (err) {
    if (!(err instanceof HTTPError)) {
      // if it isn't HTTPError instance
      err = new HTTPError(500, err);
    }
    logger.error(`Check Retailer Service Health fail. Error: ${err.message}`, {
      error: err,
      function: "checkRetailerServicesHealth",
    });
    throw err;
  }
}

export async function removeTimeoutTaskJob() {
  try {
    await removeTimeoutJob();
  } catch (err) {
    if (!(err instanceof HTTPError)) {
      // if it isn't HTTPError instance
      err = new HTTPError(500, err);
    }
    logger.error(`Remove timeout task fail. Error: ${err.message}`, {
      error: err,
      function: "removeTimeoutTaskJob",
    });
    throw err;
  }
}
