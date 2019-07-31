const _ = require("lodash");
const { HTTPError } = require("../../util/error");
const {
  remove,
  insertMany,
  find,
  bulkUpdate,
  updateMany
} = require("../../util/db");
const {
  CONFIG,
  COLLECTIONS_NAME,
  DEFAULT_SOI,
  INTELLIGENCE_STATE,
  PERMISSIONS,
  AGENT_STATE,
  DEFAULT_INTELLIGENCE
} = require("../../util/constants");
const config = require("../../config");
const soisHelpers = require("../sois/helpers");
const agentsHelpers = require("../agents/helpers");
const logger = require("../../util/logger");
const utils = require("../../util/utils");

// To avoid running check soi status multiple times
// next check will not be started if previous job doesn't finish
// TODO: when start thinking about load balance, then this data should be in memory cache, not inside service memory
let __check_sois_status__ = {};

async function addIntelligences(intelligences, securityKey) {
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
    intelligences = intelligences.map(intelligence => {
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
        //   key: "global_id",
        //   description: "global_id is undefined."
        // });
        intelligence.globalId = utils.generateGlobalId('intelligence');
        // To avoid same intelligence insert multiple time
        intelligence._id = intelligence.globalId;
      }
      intelligence = _.merge({}, defaultIntelligence, intelligence);

      // Update system information
      intelligence.system.created = Date.now();
      intelligence.system.modified = Date.now();
      intelligence.system.securityKey = securityKey;

      // Make sure agent type is uppercase
      intelligence.suitableAgents = intelligence.suitableAgents.map(agentType => {
        return _.toUpper(agentType);
      })
      
      let validateResult = utils.validateIntelligence(intelligence);

      // If it isn't valid
      if (!validateResult.valid) {
        validationError.push({
          intelligence,
          error: validateResult.errors
        });
      }
      // Need to update global_id to globalId
      soiGlobalIds[intelligence.soi.global_id] = 1;
      return intelligence;
    });

    if (validationError.length) {
      throw new HTTPError(
        400,
        validationError,
        validationError,
        "dia_00064000001"
      );
    }

    // make sure soi existed
    for (let soiGlobalId in soiGlobalIds) {
      await soisHelpers.getSOI(soiGlobalId);
    }
    logger.debug("SOIs exist!", { soiGlobalIds });
    // let result = await insertMany(COLLECTIONS_NAME.intelligences, intelligences);
    let result = await bulkUpdate(
      COLLECTIONS_NAME.intelligences,
      intelligences,
      true
    );
    return result&&result.upsertedIds || [];
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
async function getIntelligences(agentGid, securityKey) {
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
        "dia_00054000001",
        agentGid,
        securityKey
      );
    }

    // default empty intelligences
    let intelligences = [];
    agentConfig = utils.omit(agentConfig, ["_id", "securityKey"], ['system']);

    // if agent isn't active, then throw an error
    if (_.toUpper(agentConfig.system.state) !== _.toUpper(AGENT_STATE.active)) {
      throw new HTTPError(
        400,
        null,
        {
          agent: agentConfig
        },
        "dia_00054000002",
        agentGid
      );
    }

    let concurrent = Number(agentConfig.concurrent);
    if (isNaN(concurrent)) {
      // if concurrent isn't a number, then use default value
      concurrent = config.EACH_TIME_INTELLIGENCES_NUMBER;
    }

    let query = {
      status: {
        $nin: [
          INTELLIGENCE_STATE.draft,
          INTELLIGENCE_STATE.running,
          INTELLIGENCE_STATE.finished,
          INTELLIGENCE_STATE.paused
        ]
      },
      "soi.status": {
        $eq: "ACTIVE"
      },
      suitableAgents: {
        $elemMatch: {
          $eq: _.toUpper(agentConfig.type)
        }
      }
    };

    // if security key provide, get all intelligences for this security key first
    if (securityKey) {
      query[`system.${CONFIG.SECURITY_KEY_IN_DB}`] = {
        $eq: securityKey
      };
      // only return items that soi.status is ACTIVE
      // for this case, get intelligences that created by this securitykey
      intelligences = await find(COLLECTIONS_NAME.intelligences, query, {
        sort: ["soi.global_id", "priority"],
        limit: concurrent
      });
    }
    let permission = PERMISSIONS.private;
    if (!agentConfig.private) {
      permission = PERMISSIONS.public;
    }

    // if permission doesn't exit or agent is public then try to see any public intelligences need to collect
    if (
      (!permission || _.upperCase(permission) === PERMISSIONS.public) &&
      (!intelligences || !intelligences.length)
    ) {
      // if no intelligences for this securityKey and if this agent's permission is public then, get other intelligences that is public
      delete query[`system.${CONFIG.SECURITY_KEY_IN_DB}`];
      query.permission = {
        $nin: [PERMISSIONS.private]
      };

      intelligences = await find(COLLECTIONS_NAME.intelligences, query, {
        sort: ["soi.global_id", "priority"],
        limit: concurrent
      });
    }

    let gids = [];
    let sois = {};
    for (let i = 0; i < intelligences.length; i++) {
      let item = intelligences[i] || {};
      gids.push(item.globalId);
      if (sois[item.soi.global_id]) {
        item.soi = sois[item.soi.global_id];
      } else {
        let soi = await soisHelpers.getSOI(item.soi.global_id);
        soi = _.merge({}, DEFAULT_SOI, soi);
        // remove unnecessary data
        soi = utils.omit(soi, ['_id', 'security_key', 'created_at', 'created', 'modified', 'modified_at'], []);
        sois[item.soi.global_id] = soi;
        item.soi = sois[item.soi.global_id];
      }
      
      // Comment: 07/30/2019
      // Reason: Since this intelligence is reassigned, so it always need to update agent information
      // if (!item.agent) {
      //   item.agent = {
      //     global_id: agentGid,
      //     type: _.toUpper(agentConfig.type),
      //     started_at: Date.now()
      //   };
      // }
      item.system.agent = {
        globalId: agentGid,
        type: _.toUpper(agentConfig.type),
      }
    }

    // Update intelligences that return to agent
    await updateMany(
      COLLECTIONS_NAME.intelligences,
      {
        globalId: {
          $in: gids
        }
      },
      {
        $set: {
          system:{
            startedAt: Date.now(), 
            endedAt: null,
            state: INTELLIGENCE_STATE.running,
            agent: {
              globalId: agentGid,
              status: "ACTIVE",
              type: _.toUpper(agentConfig.type)
            }
          }
        }
      }
    );
    
    // TODO: Also need to update agent **lastPing**

    // Check SOI status in parallel
    // After get intelligences that need to collect, during sametime to check whether this SOI is active.
    for (let gid in sois) {
      let soi = sois[gid];
      // if this soi isn't in check status progress, then check it
      if (!__check_sois_status__[gid]) {
        (async () => {
          // change soi status to true to avoid duplicate check in same time
          __check_sois_status__[gid] = true;
          await soisHelpers.updateSOIStatus(gid, soi);
          // after finish, delete its value in hashmap
          delete __check_sois_status__[gid];
        })();
      }
    }

    return intelligences;
  } catch (err) {
    throw err;
  }
}

async function updateIntelligences(content, securityKey) {
  try {
    let contentMap = {};
    let gids = content.map(item => {
      contentMap[item.global_id] = item;
      return item.global_id;
    });
    // get intelligences by gids
    let intelligences = await find(COLLECTIONS_NAME.intelligences, {
      global_id: {
        $in: gids
      }
    });

    if (!intelligences || !intelligences.length) {
      logger.warn("No intelligences found.", { intelligences: content });
      return {};
    }

    // update modified_at, ended_at, last_collected_at and status
    intelligences = intelligences.map(item => {
      delete item._id;
      item.modified_at = Date.now();
      item.ended_at = Date.now();
      item.last_collected_at = Date.now();
      item.status = _.get(
        contentMap[item.global_id],
        "status",
        INTELLIGENCE_STATUS.finished
      );
      return item;
    });

    // add it to intelligences_history
    await insertMany(COLLECTIONS_NAME.intelligencesHistory, intelligences);

    let result = await remove(COLLECTIONS_NAME.intelligences, {
      global_id: {
        $in: gids
      }
    });
    return result;
  } catch (err) {
    throw err;
  }
}

async function deleteIntelligences(gids, securityKey) {
  // TODO: implement logic
}

module.exports = {
  addIntelligences,
  getIntelligences,
  updateIntelligences,
  deleteIntelligences
};
