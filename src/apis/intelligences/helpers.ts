const _ = require("lodash");
const { HTTPError } = require("../../util/error");
const {
  CONFIG,
  DEFAULT_SOI,
  INTELLIGENCE_STATE,
  PERMISSIONS,
  AGENT_STATE,
  SOI_STATE,
  DEFAULT_INTELLIGENCE,
} = require("../../util/constants");
const soisHelpers = require("../retailers/helpers");
const producersHelpers = require("../producers/helpers");
const logger = require("../../util/logger");
const utils = require("../../util/utils");
const { getConfig } = require("../../config");
import {
  addIntelligencesDB,
  getIntelligencesOrHistoryForManagementDB,
  updateIntelligencesStateForManagementDB,
  deleteIntelligencesOrHistoryForManagementDB,
  getIntelligencesForAgentDB,
  getIntelligencesDB,
  updateEachIntelligencesDB,
  deleteIntelligencesDB,
  addIntelligenceHistoryDB,
} from "../../dbController/IntelligenceAndHistory.ctrl";
import {
  addATaskJob,
  getTopTaskJob,
  removeTaskJob,
} from "../../dbController/TasksJobQueue.ctrl";

// To avoid running check soi status multiple times
// next check will not be started if previous job doesn't finish
// TODO: when start thinking about load balance, then this data should be in memory cache, not inside service memory

//================================================================
// Following APIs are designed for CRUD intelligences for Management UI(Desktop or web app)
async function getIntelligencesForManagement(
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
      securityKey
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
async function pauseIntelligencesForManagement(
  url: string,
  state: string,
  ids: string[],
  securityKey: string
) {
  try {
    let result = await updateIntelligencesStateForManagementDB(
      INTELLIGENCE_STATE.paused,
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
 * @param {array} ids - Intelligences Global Id
 * @param {string} securityKey - security key string
 */
async function resumeIntelligencesForManagement(
  url: string,
  state: string,
  ids: string[],
  securityKey: string
) {
  try {
    let result = await updateIntelligencesStateForManagementDB(
      INTELLIGENCE_STATE.configured,
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
 * @param {array} ids - Intelligences Global Id
 * @param {string} securityKey - security key string
 */
async function deleteIntelligencesForManagement(
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
      securityKey
    );
    return result;
  } catch (err) {
    throw err;
  }
}

//================================================================
// Following APIs are designed for Agent CRUD Intelligences
/**
 * Create intelligences
 *
 * @param {array} intelligences
 * @param {string} securityKey
 */
async function addIntelligences(intelligences: object[], securityKey: string) {
  try {
    // Comment: 07/30/2019
    // let defaultIntelligence = {
    //   permission: PERMISSIONS.private,
    //   priority: 100000,
    //   created_at: Date.now(),
    //   modified_at: Date.now(),
    //   last_collected_at: 0,
    //   started_at: 0,
    //   ended_at: 0,
    //   status: "CONFIGURED",
    //   suitable_agents: ['HEADLESSBROWSER']
    // };
    let defaultIntelligence = DEFAULT_INTELLIGENCE;
    // TODO: data validation need to improve
    let validationError = [];
    // hash table for soi globalId
    let soiGlobalIds = {};
    intelligences = intelligences.map((intelligence: any) => {
      // remove data that cannot set by user
      delete intelligence.dataset;
      delete intelligence.system;

      // let err = [];
      /*
      if (!intelligence.globalId) {
        // comment 07/25/2019 - instead of error, generate an globalid
        // err.push({
        //   key: "globalId",
        //   description: "globalId is undefined."
        // });
        intelligence.globalId = utils.generateGlobalId("intelligence");
        // To avoid same intelligence insert multiple time
        intelligence._id = intelligence.globalId;
      }
      */
      intelligence.globalId = utils.generateGlobalId("intelligence");
      intelligence = _.merge({}, defaultIntelligence, intelligence);

      // Update system information
      intelligence.system.created = Date.now();
      intelligence.system.modified = Date.now();
      intelligence.system.securityKey = securityKey;
      intelligence.system.state = AGENT_STATE.configured;

      // Make sure producer type is uppercase
      intelligence.suitableProducers = intelligence.suitableProducers.map(
        (agentType) => {
          return _.toUpper(agentType);
        }
      );
      // since just recieve SOI request, so set the state to **ACTIVE**
      if (!intelligence.soi.state) {
        intelligence.soi.state = SOI_STATE.active;
      }

      let validateResult = utils.validateIntelligence(intelligence);

      // If it isn't valid
      if (!validateResult.valid) {
        validationError.push({
          intelligence,
          error: validateResult.errors,
        });
      }
      // remove unchangable field for create
      delete intelligence.system.producer;
      delete intelligence.system.startedAt;
      delete intelligence.system.endedAt;
      delete intelligence.system.failuresNumber;

      // Need to update globalId to globalId
      soiGlobalIds[intelligence.soi.globalId] = 1;
      return intelligence;
    });

    if (validationError.length) {
      throw new HTTPError(400, validationError, validationError, "00064000001");
    }

    // make sure soi existed
    for (let soiGlobalId in soiGlobalIds) {
      await soisHelpers.getSOI(soiGlobalId);
    }
    logger.debug("SOIs exist!", { soiGlobalIds });
    // let result = await insertMany(COLLECTIONS_NAME.intelligences, intelligences);
    // let result = await bulkUpdate(
    //   COLLECTIONS_NAME.intelligences,
    //   intelligences,
    //   true
    // );
    // return (result && result.upsertedIds) || [];
    let result = await addIntelligencesDB(intelligences);
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
 * @typedef {Object} IntelligencesAndConfig
 * @property {object} producer - Agent Configuration
 * @property {array} intelligences - Intelligences Array
 */
/**
 * Get intelligences by Agent Global ID and Security Key
 *
 * Operation Index - 0005
 *
 * @param {string} agentGid - Agent Global ID
 * @param {string} securityKey - Security Key
 *
 * @returns {IntelligencesAndConfig}
 */
async function getIntelligences(agentGid: string, securityKey: string) {
  const taskJobGlobalId = utils.generateGlobalId("taskjob");
  try {
    // add a task job to the job queue
    await addATaskJob(taskJobGlobalId, agentGid);
    await waitUntilTopTask(taskJobGlobalId);
    // TODO: need to improve intelligences schedule
    // 1. Think about if a lot of intelligences, how to schedule them
    // make them can be more efficient
    // 2. Think about the case that SOI is inactive

    // avoid UI side send undefined or null as string
    if (securityKey === "undefined" || securityKey === "null") {
      securityKey = undefined;
    }

    logger.debug(`getIntelligences->agentGid: ${agentGid}`);
    logger.debug(`getIntelligences->securityKey: ${securityKey}`);
    // Step 1: get producer configuration
    let agentConfig = await producersHelpers.getAgent(agentGid, securityKey);
    logger.debug(
      `getIntelligences->agentConfig.system.securityKey: ${agentConfig.system.securityKey}`
    );
    let agentSecurityKey = agentConfig.system.securityKey;
    // avoid UI side send undefined or null as string
    if (agentSecurityKey === "undefined" || agentSecurityKey === "null") {
      agentSecurityKey = undefined;
    }
    // If security key doesn't match, then we assume this agnet doesn't belong to this user
    // For security issue, don't allow user do this
    if (_.trim(agentSecurityKey) !== _.trim(securityKey)) {
      logger.info(
        "getIntelligences, agentConfig.system.securityKey isn' same with securityKey. ",
        {
          "agentConfig.system.securityKey": agentSecurityKey,
          securityKey: securityKey,
        }
      );
      throw new HTTPError(
        400,
        null,
        { agentGlobalId: agentGid, securityKey },
        "00054000001",
        agentGid,
        securityKey
      );
    }

    // default empty intelligences
    let intelligences = [];
    agentConfig = utils.omit(agentConfig, ["_id", "securityKey"], ["system"]);

    // if producer isn't active, then throw an error
    if (_.toUpper(agentConfig.system.state) !== _.toUpper(AGENT_STATE.active)) {
      throw new HTTPError(
        400,
        null,
        {
          producer: agentConfig,
        },
        "00054000002",
        agentGid
      );
    }
    intelligences = await getIntelligencesForAgentDB(agentConfig, securityKey);
    await removeTaskJob(taskJobGlobalId);
    return intelligences;
  } catch (err) {
    await removeTaskJob(taskJobGlobalId);
    throw err;
  }
}

async function updateIntelligences(content, securityKey: string) {
  try {
    let contentMap = {};
    let gids = content.map((item) => {
      contentMap[item.globalId] = item;
      return item.globalId;
    });

    let intelligences = await getIntelligencesDB(gids, securityKey);

    if (!intelligences || !intelligences.length) {
      logger.warn("No intelligences found.", { intelligences: content });
      return {};
    }

    let failedIntelligences = [];
    let intelligenceHistory = [];
    gids = [];
    for (let i = 0; i < intelligences.length; i++) {
      // this is the intelligence get from DB
      let item = intelligences[i];
      // this is the intelligence that passed by producer
      let intelligence = contentMap[item.globalId];
      // If this intelligence was failed, then increase **failuresNumber**
      // Any state isn't FINISHED, then think it is failed, need to increase failuresNumber
      // if failuresNumber is <= max fail number, then let Agent try to collect it again
      if (
        (item.system.failuresNumber || 0) <
          CONFIG.MAX_FAIL_NUMBER_FOR_INTELLIGENCE &&
        _.get(intelligence, "system.state") !== INTELLIGENCE_STATE.finished
      ) {
        if (!item.system.failuresNumber) {
          item.system.failuresNumber = 1;
        } else {
          item.system.failuresNumber += 1;
        }
        // This intelligence need continue to retry
        failedIntelligences.push({
          globalId: item.globalId,
          system: {
            modified: Date.now(),
            endedAt: Date.now(),
            state:
              _.get(intelligence, "system.state") || INTELLIGENCE_STATE.failed,
            failuresNumber: _.get(item, "system.failuresNumber"),
            failuresReason: _.get(intelligence, "system.failuresReason"),
            producer: {
              globalId: _.get(intelligence, "system.producer.globalId"),
              type: _.get(intelligence, "system.producer.type"),
              startedAt: _.get(intelligence, "system.producer.startedAt"),
              endedAt: _.get(intelligence, "system.producer.endedAt"),
            },
          },
        });
      } else {
        // This intelligences need to move to intelligence_history
        gids.push(item.globalId);

        delete item.id;
        delete item._id;
        // if it isn't successful, then means reach max retry time, to keep why it isn't successful
        if (
          _.get(intelligence, "system.state") !== INTELLIGENCE_STATE.finished
        ) {
          item.system.failuresNumber += 1;
          item.system.failuresReason = _.get(
            intelligence,
            "system.failuresReason"
          );
        }
        item.system.modified = Date.now();
        item.system.endedAt = Date.now();
        item.system.state = _.get(
          intelligence,
          "system.state",
          INTELLIGENCE_STATE.finished
        );
        if (!item.system.producer) {
          item.system.producer = {};
        }
        let passedAgent = contentMap[item.globalId].system.producer;
        item.system.producer.globalId = passedAgent.globalId;
        item.system.producer.type = passedAgent.type;
        item.system.producer.startedAt = passedAgent.startedAt;
        item.system.producer.endedAt = passedAgent.endedAt;

        intelligenceHistory.push(item);
      }
    }

    if (failedIntelligences.length) {
      await updateEachIntelligencesDB(failedIntelligences);
    }

    // add it to intelligences_history
    for (let i = 0; i < intelligenceHistory.length; i++) {
      // remove `failuresReason` if intelligence is successful
      if (
        _.get(intelligenceHistory[i], "system.state") ==
        INTELLIGENCE_STATE.finished
      ) {
        if (_.get(intelligenceHistory[i], "system.failuresReason")) {
          _.set(intelligenceHistory[i], "system.failuresReason", "");
        }
      }
    }
    await addIntelligenceHistoryDB(intelligenceHistory);
    let result = await deleteIntelligencesDB(gids, securityKey);
    return result;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  pauseIntelligencesForManagement,
  resumeIntelligencesForManagement,
  deleteIntelligencesForManagement,
  getIntelligencesForManagement,
  addIntelligences,
  getIntelligences,
  updateIntelligences,
};
