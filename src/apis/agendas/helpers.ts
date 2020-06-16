import * as _ from "lodash";
import { LessThan } from "typeorm";
const { getConfig } = require("../../config");
const logger = require("../../util/logger");
const { INTELLIGENCE_STATE } = require("../../util/constants");
const { HTTPError } = require("../../util/error");
import { updateIntelligencesStateForManagementDB } from "../../dbController/IntelligenceAndHistory.ctrl";
import { removeTimeoutJob } from '../../dbController/TasksJobQueue.ctrl';
import { getSOIsDB } from "../../dbController/SOI.ctrl";
const { updateSOIState } = require("../sois/helpers");

/**
 * Update all
 */
export async function updateTimeoutIntelligences(securityKey?) {
  try {
    const intelligenceTimeout = getConfig("TIMEOUT_VALUE_FOR_INTELLIGENCE");
    const startedAt = Date.now() - intelligenceTimeout;
    logger.info(`Update intelligences if they are timeout`, {
      fun: "updateTimeoutIntelligences",
      intelligenceTimeout,
      startedAt,
      securityKey,
    });
    await updateIntelligencesStateForManagementDB(
      INTELLIGENCE_STATE.timeout,
      null,
      null,
      startedAt,
      securityKey
    );
  } catch (err) {
    if (!(err instanceof HTTPError)) {
      // if it isn't HTTPError instance
      err = new HTTPError(500, err);
    }
    logger.error(
      `Update intelligences if they are timeout fail. Error: ${err.message}`,
      { error: err, fun: "updateTimeoutIntelligences" }
    );
    throw err;
  }
}

export async function checkAnalystServicesHealth(securityKey?) {
  try {
    const intervalCheckAS = getConfig("SOI_STATE_CHECK_TIME");
    const lastModifiedAt = Date.now() - intervalCheckAS;
    const analystServices = await getSOIsDB(
      {
        system_modified_at: LessThan(lastModifiedAt),
      },
      securityKey
    );
    logger.info(`Check Analyst Service Health`, {
      fun: "checkAnalystServicesHealth",
      intervalCheckAS,
      lastModifiedAt,
      analystServices: analystServices.length,
    });
    for (let i = 0; i < analystServices.length; i++) {
      await updateSOIState(analystServices[i].globalId, analystServices[i]);
    }
  } catch (err) {
    if (!(err instanceof HTTPError)) {
      // if it isn't HTTPError instance
      err = new HTTPError(500, err);
    }
    logger.error(
      `Check Analyst Service Health fail. Error: ${err.message}`,
      { error: err, fun: "checkAnalystServicesHealth" }
    );
    throw err;
  }
}

export async function removeTimeoutTaskJob(){
  try{
    await removeTimeoutJob();
  }catch(err){
    if (!(err instanceof HTTPError)) {
      // if it isn't HTTPError instance
      err = new HTTPError(500, err);
    }
    logger.error(
      `Remove timeout task fail. Error: ${err.message}`,
      { error: err, fun: "removeTimeoutTaskJob" }
    );
    throw err;
  }
}
