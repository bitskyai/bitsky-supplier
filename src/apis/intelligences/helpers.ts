const _ = require("lodash");
const ObjectId = require("mongodb").ObjectID;
const { HTTPError } = require("../../util/error");
const {
  remove,
  insertMany,
  find,
  count,
  bulkUpdate,
  updateMany,
  deleteMany
} = require("../../util/db");
const {
  CONFIG,
  COLLECTIONS_NAME,
  DEFAULT_SOI,
  INTELLIGENCE_STATE,
  PERMISSIONS,
  AGENT_STATE,
  SOI_STATE,
  DEFAULT_INTELLIGENCE
} = require("../../util/constants");
const config = require("../../config");
const soisHelpers = require("../sois/helpers");
const agentsHelpers = require("../agents/helpers");
const logger = require("../../util/logger");
const utils = require("../../util/utils");
import {
  addIntelligencesDB,
  getIntelligencesForManagementDB,
  updateIntelligencesStateForManagementDB,
  deleteIntelligencesForManagementDB,
  getIntelligencesForAgentDB,
  getIntelligencesDB,
  updateEachIntelligencesDB,
  addIntelligenceHistoryDB,
  deleteIntelligencesDB
} from "../../dbController/Intelligence.ctrl";
import { EventListenerTypes } from "typeorm/metadata/types/EventListenerTypes";

// To avoid running check soi status multiple times
// next check will not be started if previous job doesn't finish
// TODO: when start thinking about load balance, then this data should be in memory cache, not inside service memory
let __check_sois_status__ = {};

//================================================================
// Following APIs are designed for CRUD intelligences
async function getIntelligencesForManagement(
  cursor: string,
  url: string,
  state: string,
  limit: number,
  securityKey: string
) {
  try {
    return await getIntelligencesForManagementDB(
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
  ids: string[],
  securityKey: string
) {
  try {
    let result = await updateIntelligencesStateForManagementDB(
      INTELLIGENCE_STATE.paused,
      url,
      ids,
      securityKey
    );
    console.log(result);
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
  ids: string[],
  securityKey: string
) {
  try {
    let result = await updateIntelligencesStateForManagementDB(
      INTELLIGENCE_STATE.configured,
      url,
      ids,
      securityKey
    );
    console.log(result);
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
  ids: string[],
  securityKey: string
) {
  try {
    let result = await deleteIntelligencesForManagementDB(
      url,
      ids,
      securityKey
    );
    console.log(result);
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
    //   suitable_agents: ['BROWSEREXTENSION']
    // };
    let defaultIntelligence = DEFAULT_INTELLIGENCE;
    // TODO: data validation need to improve
    let validationError = [];
    // hash table for soi globalId
    let soiGlobalIds = {};
    intelligences = intelligences.map((intelligence: any) => {
      // remove data that cannot set by user
      // Comment: 07/30/2019
      // delete intelligence.created_at;
      // delete intelligence.modified_at;
      // delete intelligence.last_collected_at;
      // delete intelligence.started_at;
      // delete intelligence.ended_at;
      // delete intelligence.status;

      let err = [];
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
      intelligence = _.merge({}, defaultIntelligence, intelligence);

      // Update system information
      intelligence.system.created = Date.now();
      intelligence.system.modified = Date.now();
      intelligence.system.securityKey = securityKey;

      // Make sure agent type is uppercase
      intelligence.suitableAgents = intelligence.suitableAgents.map(
        agentType => {
          return _.toUpper(agentType);
        }
      );
      // since just recieve SOI request, so set the state to **ACTIVE**
      intelligence.soi.state = SOI_STATE.active;

      let validateResult = utils.validateIntelligence(intelligence);

      // If it isn't valid
      if (!validateResult.valid) {
        validationError.push({
          intelligence,
          error: validateResult.errors
        });
      }
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

/**
 * @typedef {Object} IntelligencesAndConfig
 * @property {object} agent - Agent Configuration
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
  try {
    // TODO: need to improve intelligences schedule
    // 1. Think about if a lot of intelligences, how to schedule them
    // make them can be more efficient
    // 2. Think about the case that SOI is inactive

    // Step 1: get agent configuration
    let agentConfig = await agentsHelpers.getAgent(agentGid);
    // If security key doesn't match, then we assume this agnet doesn't belong to this user
    // For security issue, don't allow user do this
    if (agentConfig.system.securityKey !== securityKey) {
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

    // if agent isn't active, then throw an error
    if (_.toUpper(agentConfig.system.state) !== _.toUpper(AGENT_STATE.active)) {
      throw new HTTPError(
        400,
        null,
        {
          agent: agentConfig
        },
        "00054000002",
        agentGid
      );
    }
    intelligences = await getIntelligencesForAgentDB(agentConfig, securityKey);
    return intelligences;
  } catch (err) {
    throw err;
  }
}

async function updateIntelligences(content, securityKey) {
  try {
    let contentMap = {};
    let gids = content.map(item => {
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
    gids=[];
    for (let i = 0; i < intelligences.length; i++) {
      let item = intelligences[i];
      // If this intelligence was failed, then increase **failuresNumber**
      if (item.system.state === INTELLIGENCE_STATE.failed) {
        if (!item.system.failuresNumber) {
          item.system.failuresNumber = 1;
        } else {
          item.system.failuresNumber += 1;
        }
      }

      if (
        item.system.failuresNumber <= CONFIG.MAX_FAIL_NUMBER_FOR_INTELLIGENCE
      ) {
        // This intelligence need continue to retry
        failedIntelligences.push({
          globalId: item.globalId,
          system: {
            modified: Date.now(),
            endedAt: Date.now(),
            state: INTELLIGENCE_STATE.failed,
            failuresNumber: item.system.failuresNumber
          }
        });
      } else {
        // This intelligences need to move to intelligence_history
        gids.push(item.globalId);

        delete item.id;
        delete item._id;
        item.system.modified = Date.now();
        item.system.endedAt = Date.now();
        item.system.state = _.get(
          contentMap[item.globalId],
          "system.state",
          INTELLIGENCE_STATE.finished
        );
        if (!item.system.agent) {
          item.system.agent = {};
        }
        let passedAgent = contentMap[item.globalId].system.agent;
        item.system.agent.globalId = passedAgent.globalId;
        item.system.agent.type = passedAgent.type;
        item.system.agent.startedAt = passedAgent.startedAt;
        item.system.agent.endedAt = passedAgent.endedAt;

        intelligenceHistory.push(item);
      }
    }

    if(failedIntelligences.length){
      await updateEachIntelligencesDB(failedIntelligences);
    }

    // add it to intelligences_history
    // await insertMany(COLLECTIONS_NAME.intelligencesHistory, intelligences);
    await addIntelligenceHistoryDB(intelligenceHistory);

    // let result = await remove(COLLECTIONS_NAME.intelligences, {
    //   globalId: {
    //     $in: gids
    //   }
    // });
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
  updateIntelligences
};
