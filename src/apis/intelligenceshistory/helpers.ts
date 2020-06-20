const _ = require("lodash");
const { HTTPError } = require("../../util/error");
const logger = require("../../util/logger");
import {
  getIntelligencesOrHistoryForManagementDB,
  deleteIntelligencesOrHistoryForManagementDB,
} from "../../dbController/IntelligenceAndHistory.ctrl";
const addIntelligences = require("../intelligences/helpers").addIntelligences;
import { getSOI } from "../sois/helpers";
//================================================================
// Following APIs are designed for CRUD intelligences
async function getIntelligencesHistoryForManagement(
  cursor: string,
  url: string,
  state: string,
  limit: number,
  securityKey: string
) {
  try {
    return await getIntelligencesOrHistoryForManagementDB(
      cursor,
      url,
      state,
      limit,
      securityKey,
      true
    );
  } catch (err) {
    throw err;
  }
}

/**
 * ids priority high then url, if you pass both then only ids will be executed
 * @param {string} url - url for filter
 * @param {array} ids - Intelligences Global Id
 * @param {string} securityKey - security key string
 */
async function deleteIntelligencesHistoryForManagement(
  url: string,
  state: string,
  ids: string[],
  securityKey: string
) {
  try {
    let result = await deleteIntelligencesOrHistoryForManagementDB(
      url,
      state,
      ids,
      securityKey,
      true
    );
    return result;
  } catch (err) {
    throw err;
  }
}

/**
 * ids priority high then url, if you pass both then only ids will be executed
 * @param {string} url - url for filter
 * @param {array} ids - Intelligences Global Id
 * @param {string} securityKey - security key string
 */
async function rerunIntelligencesForManagement(
  url: string,
  state: string,
  ids: string[],
  securityKey: string
) {
  try {
    logger.info(`url: ${url}, state: ${state}, ids: ${ids}`, {
      function: "rerunIntelligencesForManagement",
    });
    console.log(`url: ${url}, state: ${state}, ids: ${ids}`);
    const result = await getIntelligencesOrHistoryForManagementDB(
      null,
      url,
      state,
      1000000,
      securityKey,
      true,
      ids
    );
    logger.debug(`Total Intelligences: ${result.total}`, {
      function: "rerunIntelligencesForManagement",
    });
    let soisState = {};
    let intelligences = result.intelligences;
    for (let i = 0; i < intelligences.length; i++) {
      let soiId = intelligences[i].soi.globalId;
      if(!soisState[soiId]){
        let soi = await getSOI(soiId, securityKey);
        soisState[soiId] = soi.system.state;
      }
      intelligences[i].soi.state = soisState[soiId];
    }
    await addIntelligences(intelligences, securityKey);
    return {
      total: result.total,
    };
  } catch (err) {
    throw err;
  }
}

module.exports = {
  deleteIntelligencesHistoryForManagement,
  getIntelligencesHistoryForManagement,
  rerunIntelligencesForManagement,
};
