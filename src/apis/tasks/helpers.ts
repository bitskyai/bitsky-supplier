const _ = require("lodash");
const { HTTPError } = require("../../util/error");
const {
  CONFIG,
  DEFAULT_RETAILER,
  TASK_STATE,
  PERMISSIONS,
  PRODUCER_STATE,
  RETAILER_STATE,
  DEFAULT_TASK,
} = require("../../util/constants");
const retailersHelpers = require("../retailers/helpers");
const producersHelpers = require("../producers/helpers");
const logger = require("../../util/logger");
const utils = require("../../util/utils");
const { getConfig } = require("../../config");
import {
  addTasksDB,
  getTasksOrHistoryForManagementDB,
  updateTasksStateForManagementDB,
  deleteTasksOrHistoryForManagementDB,
  getTasksForProducerDB,
  getTasksDB,
  updateEachTasksDB,
  deleteTasksDB,
  addTaskHistoryDB,
} from "../../dbController/TaskAndHistory.ctrl";
import {
  addATaskJob,
  getTopTaskJob,
  removeTaskJob,
} from "../../dbController/TasksJobQueue.ctrl";

// To avoid running check retailer status multiple times
// next check will not be started if previous job doesn't finish
// TODO: when start thinking about load balance, then this data should be in memory cache, not inside service memory

//================================================================
// Following APIs are designed for CRUD tasks for Management UI(Desktop or web app)
async function getTasksForManagement(
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
      securityKey
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
async function pauseTasksForManagement(
  url: string,
  state: string,
  ids: string[],
  securityKey: string
) {
  try {
    let result = await updateTasksStateForManagementDB(
      TASK_STATE.paused,
      url,
      state,
      ids,
      null,
      securityKey
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
async function resumeTasksForManagement(
  url: string,
  state: string,
  ids: string[],
  securityKey: string
) {
  try {
    let result = await updateTasksStateForManagementDB(
      TASK_STATE.configured,
      url,
      state,
      ids,
      null,
      securityKey
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
async function deleteTasksForManagement(
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
      securityKey
    );
    return result;
  } catch (err) {
    throw err;
  }
}

//================================================================
// Following APIs are designed for Producer CRUD Tasks
/**
 * Create tasks
 *
 * @param {array} tasks
 * @param {string} securityKey
 */
async function addTasks(tasks: object[], securityKey: string) {
  try {
    // Comment: 07/30/2019
    // let defaultTask = {
    //   permission: PERMISSIONS.private,
    //   priority: 100000,
    //   created_at: Date.now(),
    //   modified_at: Date.now(),
    //   last_collected_at: 0,
    //   started_at: 0,
    //   ended_at: 0,
    //   status: "CONFIGURED",
    //   suitable_producers: ['HEADLESSBROWSER']
    // };
    let defaultTask = DEFAULT_TASK;
    // TODO: data validation need to improve
    let validationError = [];
    // hash table for retailer globalId
    let retailerGlobalIds = {};
    tasks = tasks.map((task: any) => {
      // remove data that cannot set by user
      delete task.dataset;
      delete task.system;

      // let err = [];
      /*
      if (!task.globalId) {
        // comment 07/25/2019 - instead of error, generate an globalid
        // err.push({
        //   key: "globalId",
        //   description: "globalId is undefined."
        // });
        task.globalId = utils.generateGlobalId("task");
        // To avoid same task insert multiple time
        task._id = task.globalId;
      }
      */
      task.globalId = utils.generateGlobalId("task");
      task = _.merge({}, defaultTask, task);

      // Update system information
      task.system.created = Date.now();
      task.system.modified = Date.now();
      task.system.securityKey = securityKey;
      task.system.state = PRODUCER_STATE.configured;

      // Make sure producer type is uppercase
      task.suitableProducers = task.suitableProducers.map(
        (producerType) => {
          return _.toUpper(producerType);
        }
      );
      // since just recieve Retailer request, so set the state to **ACTIVE**
      if (!task.retailer.state) {
        task.retailer.state = RETAILER_STATE.active;
      }

      let validateResult = utils.validateTask(task);

      // If it isn't valid
      if (!validateResult.valid) {
        validationError.push({
          task,
          error: validateResult.errors,
        });
      }
      // remove unchangable field for create
      delete task.system.producer;
      delete task.system.startedAt;
      delete task.system.endedAt;
      delete task.system.failuresNumber;

      // Need to update globalId to globalId
      retailerGlobalIds[task.retailer.globalId] = 1;
      return task;
    });

    if (validationError.length) {
      throw new HTTPError(400, validationError, validationError, "00064000001");
    }

    // make sure retailer existed
    for (let retailerGlobalId in retailerGlobalIds) {
      await retailersHelpers.getRetailer(retailerGlobalId);
    }
    logger.debug("Retailers exist!", { retailerGlobalIds });
    // let result = await insertMany(COLLECTIONS_NAME.tasks, tasks);
    // let result = await bulkUpdate(
    //   COLLECTIONS_NAME.tasks,
    //   tasks,
    //   true
    // );
    // return (result && result.upsertedIds) || [];
    let result = await addTasksDB(tasks);
    return result;
  } catch (err) {
    throw err;
  }
}

async function waitUntilTopTask(globalId) {
  try {
    return new Promise(async (resolve, reject) => {
      const startTime = Date.now();
      const taskJobTimeout = getConfig("TASK_JOB_TIMEOUT");
      let waitHandler = setInterval(async () => {
        let job = await getTopTaskJob();
        if (!job || !job.global_id) {
          // this means all jobs are timeout, but this producer is still waiting
          // normally this happend the intervalAgendas removeTimeoutTaskJob
          logger.info(
            `No job in the queue, this happened because intervalAgendas removeTimeoutTaskJob`,
            { function: "waitUntilTopTask" }
          );
          clearInterval(waitHandler);
          reject(false);
          return;
        }
        logger.debug(
          `Top GlobalId in job queue:${job.global_id}, globalId: ${globalId}`,
          { function: "waitUntilTopTask" }
        );
        if (job.global_id == globalId) {
          logger.debug(`${globalId} is top job now`, {
            function: "waitUntilTopTask",
          });
          clearInterval(waitHandler);
          resolve(true);
        } else if (Date.now() - startTime > taskJobTimeout) {
          logger.error(`${globalId} is timeout`, {
            function: "waitUntilTopTask",
          });
          clearInterval(waitHandler);
          reject(false);
        }
      }, 100);
    });
  } catch (err) {
    throw err;
  }
}

/**
 * @typedef {Object} TasksAndConfig
 * @property {object} producer - Producer Configuration
 * @property {array} tasks - Tasks Array
 */
/**
 * Get tasks by Producer Global ID and Security Key
 *
 * Operation Index - 0005
 *
 * @param {string} producerGid - Producer Global ID
 * @param {string} securityKey - Security Key
 *
 * @returns {TasksAndConfig}
 */
async function getTasks(producerGid: string, securityKey: string) {
  const taskJobGlobalId = utils.generateGlobalId("taskjob");
  try {
    // add a task job to the job queue
    await addATaskJob(taskJobGlobalId, producerGid);
    await waitUntilTopTask(taskJobGlobalId);
    // TODO: need to improve tasks schedule
    // 1. Think about if a lot of tasks, how to schedule them
    // make them can be more efficient
    // 2. Think about the case that Retailer is inactive

    // avoid UI side send undefined or null as string
    if (securityKey === "undefined" || securityKey === "null") {
      securityKey = undefined;
    }

    logger.debug(`getTasks->producerGid: ${producerGid}`);
    logger.debug(`getTasks->securityKey: ${securityKey}`);
    // Step 1: get producer configuration
    let producerConfig = await producersHelpers.getProducer(producerGid, securityKey);
    logger.debug(
      `getTasks->producerConfig.system.securityKey: ${producerConfig.system.securityKey}`
    );
    let producerSecurityKey = producerConfig.system.securityKey;
    // avoid UI side send undefined or null as string
    if (producerSecurityKey === "undefined" || producerSecurityKey === "null") {
      producerSecurityKey = undefined;
    }
    // If security key doesn't match, then we assume this agnet doesn't belong to this user
    // For security issue, don't allow user do this
    if (_.trim(producerSecurityKey) !== _.trim(securityKey)) {
      logger.info(
        "getTasks, producerConfig.system.securityKey isn' same with securityKey. ",
        {
          "producerConfig.system.securityKey": producerSecurityKey,
          securityKey: securityKey,
        }
      );
      throw new HTTPError(
        400,
        null,
        { producerGlobalId: producerGid, securityKey },
        "00054000001",
        producerGid,
        securityKey
      );
    }

    // default empty tasks
    let tasks = [];
    producerConfig = utils.omit(producerConfig, ["_id", "securityKey"], ["system"]);

    // if producer isn't active, then throw an error
    if (_.toUpper(producerConfig.system.state) !== _.toUpper(PRODUCER_STATE.active)) {
      throw new HTTPError(
        400,
        null,
        {
          producer: producerConfig,
        },
        "00054000002",
        producerGid
      );
    }
    tasks = await getTasksForProducerDB(producerConfig, securityKey);
    await removeTaskJob(taskJobGlobalId);
    return tasks;
  } catch (err) {
    await removeTaskJob(taskJobGlobalId);
    throw err;
  }
}

async function updateTasks(content, securityKey: string) {
  try {
    let contentMap = {};
    let gids = content.map((item) => {
      contentMap[item.globalId] = item;
      return item.globalId;
    });

    let tasks = await getTasksDB(gids, securityKey);

    if (!tasks || !tasks.length) {
      logger.warn("No tasks found.", { tasks: content });
      return {};
    }

    let failedTasks = [];
    let taskHistory = [];
    gids = [];
    for (let i = 0; i < tasks.length; i++) {
      // this is the task get from DB
      let item = tasks[i];
      // this is the task that passed by producer
      let task = contentMap[item.globalId];
      // If this task was failed, then increase **failuresNumber**
      // Any state isn't FINISHED, then think it is failed, need to increase failuresNumber
      // if failuresNumber is <= max fail number, then let Producer try to collect it again
      if (
        (item.system.failuresNumber || 0) <
          CONFIG.MAX_FAIL_NUMBER_FOR_TASK &&
        _.get(task, "system.state") !== TASK_STATE.finished
      ) {
        if (!item.system.failuresNumber) {
          item.system.failuresNumber = 1;
        } else {
          item.system.failuresNumber += 1;
        }
        // This task need continue to retry
        failedTasks.push({
          globalId: item.globalId,
          system: {
            modified: Date.now(),
            endedAt: Date.now(),
            state:
              _.get(task, "system.state") || TASK_STATE.failed,
            failuresNumber: _.get(item, "system.failuresNumber"),
            failuresReason: _.get(task, "system.failuresReason"),
            producer: {
              globalId: _.get(task, "system.producer.globalId"),
              type: _.get(task, "system.producer.type"),
              startedAt: _.get(task, "system.producer.startedAt"),
              endedAt: _.get(task, "system.producer.endedAt"),
            },
          },
        });
      } else {
        // This tasks need to move to task_history
        gids.push(item.globalId);

        delete item.id;
        delete item._id;
        // if it isn't successful, then means reach max retry time, to keep why it isn't successful
        if (
          _.get(task, "system.state") !== TASK_STATE.finished
        ) {
          item.system.failuresNumber += 1;
          item.system.failuresReason = _.get(
            task,
            "system.failuresReason"
          );
        }
        item.system.modified = Date.now();
        item.system.endedAt = Date.now();
        item.system.state = _.get(
          task,
          "system.state",
          TASK_STATE.finished
        );
        if (!item.system.producer) {
          item.system.producer = {};
        }
        let passedProducer = contentMap[item.globalId].system.producer;
        item.system.producer.globalId = passedProducer.globalId;
        item.system.producer.type = passedProducer.type;
        item.system.producer.startedAt = passedProducer.startedAt;
        item.system.producer.endedAt = passedProducer.endedAt;

        taskHistory.push(item);
      }
    }

    if (failedTasks.length) {
      await updateEachTasksDB(failedTasks);
    }

    // add it to tasks_history
    for (let i = 0; i < taskHistory.length; i++) {
      // remove `failuresReason` if task is successful
      if (
        _.get(taskHistory[i], "system.state") ==
        TASK_STATE.finished
      ) {
        if (_.get(taskHistory[i], "system.failuresReason")) {
          _.set(taskHistory[i], "system.failuresReason", "");
        }
      }
    }
    await addTaskHistoryDB(taskHistory);
    let result = await deleteTasksDB(gids, securityKey);
    return result;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  pauseTasksForManagement,
  resumeTasksForManagement,
  deleteTasksForManagement,
  getTasksForManagement,
  addTasks,
  getTasks,
  updateTasks,
};
