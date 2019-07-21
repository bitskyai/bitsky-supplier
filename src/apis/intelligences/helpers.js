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
  INTELLIGENCE_STATUS,
  PERMISSIONS,
  AGENT_STATE
} = require("../../util/constants");
const config = require("../../config");
const soisHelpers = require("../sois/helpers");
const agentsHelpers = require('../agents/helpers');
const logger = require("../../util/logger");
const utils = require('../../util/utils');

// To avoid running check soi status multiple times
// next check will not be started if previous job doesn't finish
// TODO: when start thinking about load balance, then this data should be in memory cache, not inside service memory
let __check_sois_status__ = {};

async function addIntelligences(intelligences, securityKey) {
  try {
    let defaultIntelligence = {
      permission: PERMISSIONS.private,
      priority: 100000,
      created_at: Date.now(),
      modified_at: Date.now(),
      last_collected_at: 0,
      started_at: 0,
      ended_at: 0,
      status: "CONFIGURED",
      suitable_agents: ["browserExtension"]
    };
    // TODO: data validation need to improve
    let validationError = [];
    // hash table for soi globalId
    let soiGlobalIds = {};
    intelligences = intelligences.map(intelligence => {
      // remove data that cannot set by user
      delete intelligence.created_at;
      delete intelligence.modified_at;
      delete intelligence.last_collected_at;
      delete intelligence.started_at;
      delete intelligence.ended_at;
      delete intelligence.status;
      let err = [];
      if (!intelligence.global_id) {
        err.push({
          key: "global_id",
          description: "global_id is undefined."
        });
      }
      if (!intelligence.soi.global_id) {
        err.push({
          key: "soi.global_id",
          description: "soi.global_id is undefined."
        });
      }
      if (!intelligence.url) {
        err.push({
          key: "url",
          description: "url is undefined."
        });
      }
      if (err.length) {
        validationError.push({
          intelligence,
          error: err
        });
      }
      intelligence._id = intelligence.global_id;
      intelligence = _.merge({}, defaultIntelligence, intelligence);
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
    return result;
  } catch (err) {
    throw err;
  }
}

/**
 * 
 * 
 * Operation Index - 0005
 * 
 * @param {*} agentGid 
 */
async function getIntelligences(agentGid, securityKey) {
  try {
    // TODO: need to improve intelligences schedule
    // 1. Think about if a lot of intelligences, how to schedule them
    // make them can be more efficient
    // 2. think about the case that SOI is inactive

    // Step 1: get agent configuration
    let agentConfig = await agentsHelpers.getAgent(agentGid);
    // default empty intelligences
    let intelligences = [];
    agentConfig = utils.omit(agentConfig, ['_id', 'security_key']);

    // if agent isn't active, then return empty intelligences
    if(_.toUpper(agentConfig.state) !== _.toUpper(AGENT_STATE.active)){
      return {
        agent: agentConfig,
        intelligences
      }
    }

    let concurrent = Number(agentConfig.concurrent);
    if (isNaN(concurrent)) {
      concurrent = config.EACH_TIME_INTELLIGENCES_NUMBER;
    }

    let query = {
      status: {
        $nin: [
          INTELLIGENCE_STATUS.running,
          INTELLIGENCE_STATUS.finished,
          INTELLIGENCE_STATUS.paused
        ]
      },
      "soi.status": {
        $eq: "ACTIVE"
      }
    };

    // if security key provide, get all intelligences for this security key first
    if (securityKey) {
      query[CONFIG.SECURITY_KEY_IN_DB] = securityKey;
      // only return items that soi.status is ACTIVE
      // for this case, get intelligences that created by this securitykey
      intelligences = await find(COLLECTIONS_NAME.intelligences, query, {
        sort: ["soi.global_id", "priority"],
        limit: limit
      });
    }

    // if permission doesn't exit or agent is public then try to see any public intelligences need to collect
    if (
      (!permission || _.upperCase(permission) === PERMISSIONS.public) &&
      (!intelligences || !intelligences.length)
    ) {
      // if no intelligences for this securityKey and if this agent's permission is public then, get other intelligences that is public
      delete query[CONFIG.SECURITY_KEY_IN_DB];
      query.permission = {
        $nin: [PERMISSIONS.private]
      };

      intelligences = await find(COLLECTIONS_NAME.intelligences, query, {
        sort: ["soi.global_id", "priority"],
        limit: limit
      });
    }

    let gids = [];
    let sois = {};
    for (let i = 0; i < intelligences.length; i++) {
      let item = intelligences[i] || {};
      gids.push(item.global_id);
      if (sois[item.soi.global_id]) {
        item.soi = sois[item.soi.global_id];
      } else {
        let soi = await soisHelpers.getSOI(item.soi.global_id);
        sois[item.soi.global_id] = _.merge({}, DEFAULT_SOI, soi);
        item.soi = sois[item.soi.global_id];
      }
      if (!item.agent) {
        item.agent = {
          global_id: agentGid,
          status: "ACTIVE",
          type: agentType,
          started_at: Date.now()
        };
      }
    }

    await updateMany(
      COLLECTIONS_NAME.intelligences,
      {
        global_id: {
          $in: gids
        }
      },
      {
        $set: {
          started_at: Date.now(),
          status: "RUNNING",
          ended_at: 0,
          agent: {
            global_id: agentGid,
            status: "ACTIVE",
            type: agentType,
            started_at: Date.now()
          }
        }
      }
    );

    // Check SOI status in parallel
    /*
            After get intelligences that need to collect, during sametime to check whether this SOI is active. 
         */
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
