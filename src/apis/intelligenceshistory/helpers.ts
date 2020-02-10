const _ = require("lodash");
const { HTTPError } = require("../../util/error");
const logger = require("../../util/logger");
import {
  getIntelligencesOrHistoryForManagementDB,
  deleteIntelligencesOrHistoryForManagementDB
} from "../../dbController/IntelligenceAndHistory.ctrl";

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
  ids: string[],
  securityKey: string
) {
  try {
    let result = await deleteIntelligencesOrHistoryForManagementDB(
      url,
      ids,
      securityKey,
      true
    );
    return result;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  deleteIntelligencesHistoryForManagement,
  getIntelligencesHistoryForManagement,
};
