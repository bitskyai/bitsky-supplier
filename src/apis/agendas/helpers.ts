import * as _ from "lodash";
import { LessThan } from "typeorm";
const { getConfig } = require("../../config");
const logger = require("../../util/logger");
const { INTELLIGENCE_STATE } = require("../../util/constants");
const { HTTPError } = require("../../util/error");
import { updateIntelligencesStateForManagementDB } from "../../dbController/IntelligenceAndHistory.ctrl";
import { removeTimeoutJob } from "../../dbController/TasksJobQueue.ctrl";
import { getNeedCheckHealthSOIsDB } from "../../dbController/SOI.ctrl";
const { updateSOIState } = require("../sois/helpers");

/**
 * Update all
 */
export async function updateTimeoutIntelligences(securityKey?) {
  try {
    const intelligenceTimeout = getConfig("TIMEOUT_VALUE_FOR_INTELLIGENCE");
    const startedAt = Date.now() - intelligenceTimeout;
    logger.info(`Update intelligences if they are timeout`, {
      function: "updateTimeoutIntelligences",
      intelligenceTimeout,
      startedAt,
      securityKey,
    });
    await updateIntelligencesStateForManagementDB(
      INTELLIGENCE_STATE.timeout,
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
      `Update intelligences if they are timeout fail. Error: ${err.message}`,
      { error: err, function: "updateTimeoutIntelligences" }
    );
    throw err;
  }
}

export async function checkAnalystServicesHealth(securityKey?) {
  try {
    const intervalCheckAS = getConfig("SOI_STATE_CHECK_TIME");
    const lastPing = Date.now() - intervalCheckAS;
    const analystServices = await getNeedCheckHealthSOIsDB(
      lastPing,
      securityKey
    );
    logger.info(`Check Analyst Service Health`, {
      function: "checkAnalystServicesHealth",
      intervalCheckAS,
      lastPing,
      analystServices: analystServices.length,
    });
    for (let i = 0; i < analystServices.length; i++) {
      await updateSOIState(analystServices[i].globalId, analystServices[i], true);
    }
  } catch (err) {
    if (!(err instanceof HTTPError)) {
      // if it isn't HTTPError instance
      err = new HTTPError(500, err);
    }
    logger.error(`Check Analyst Service Health fail. Error: ${err.message}`, {
      error: err,
      function: "checkAnalystServicesHealth",
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
