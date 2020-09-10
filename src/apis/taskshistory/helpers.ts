const _ = require("lodash");
const { HTTPError } = require("../../util/error");
const logger = require("../../util/logger");
import {
  getTasksOrHistoryForManagementDB,
  deleteTasksOrHistoryForManagementDB,
} from "../../dbController/TaskAndHistory.ctrl";
const addTasks = require("../tasks/helpers").addTasks;
import { getRetailer } from "../retailers/helpers";
//================================================================
// Following APIs are designed for CRUD tasks
async function getTasksHistoryForManagement(
  cursor: string,
  url: string,
  state: string,
  limit: number,
  securityKey: string
) {
  try {
    return await getTasksOrHistoryForManagementDB(
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
 * @param {array} ids - Tasks Global Id
 * @param {string} securityKey - security key string
 */
async function deleteTasksHistoryForManagement(
  url: string,
  state: string,
  ids: string[],
  securityKey: string
) {
  try {
    let result = await deleteTasksOrHistoryForManagementDB(
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
 * @param {array} ids - Tasks Global Id
 * @param {string} securityKey - security key string
 */
async function rerunTasksForManagement(
  url: string,
  state: string,
  ids: string[],
  securityKey: string
) {
  try {
    logger.info(`url: ${url}, state: ${state}, ids: ${ids}`, {
      function: "rerunTasksForManagement",
    });
    console.log(`url: ${url}, state: ${state}, ids: ${ids}`);
    const result = await getTasksOrHistoryForManagementDB(
      null,
      url,
      state,
      1000000,
      securityKey,
      true,
      ids
    );
    logger.debug(`Total Tasks: ${result.total}`, {
      function: "rerunTasksForManagement",
    });
    let retailersState = {};
    let tasks = result.tasks;
    for (let i = 0; i < tasks.length; i++) {
      // update retailer state
      let retailerId = tasks[i].retailer.globalId;
      if(!retailersState[retailerId]){
        let retailer = await getRetailer(retailerId, securityKey);
        retailersState[retailerId] = retailer.system.state;
      }
      tasks[i].retailer.state = retailersState[retailerId];
    }
    await addTasks(tasks, securityKey);
    return {
      total: result.total,
    };
  } catch (err) {
    throw err;
  }
}

module.exports = {
  deleteTasksHistoryForManagement,
  getTasksHistoryForManagement,
  rerunTasksForManagement,
};
