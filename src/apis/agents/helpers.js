const _ = require("lodash");
const axios = require("axios");
const {
  CONFIG,
  DEFAULT_Agent,
  COLLECTIONS_NAME
} = require("../../util/constants");
const { HTTPError } = require("../../util/error");
const {
  find,
  findOneByGlobalId,
  insertOne,
  updateOne,
  updateMany,
  remove
} = require("../../util/db");
const config = require("../../config");
const logger = require("../../util/logger");

/**
 * Check an agent exist or not, if exist return this agent
 * @param {string} gid - Agent global ID
 * @param {string} securityKey - request security key if passed
 * @returns {Object} - agent
 */
async function checkAgentExistByGlobalID(gid, securityKey) {
  try {
    let query = {
      global_id: {
        $eq: gid
      }
    };
    if (securityKey) {
      query[CONFIG.SECURITY_KEY_IN_DB] = {
        $eq: securityKey
      };
    }

    let agent = await find(COLLECTIONS_NAME.agents, query);

    // agent doesn't exist
    if (!agent || !agent.length) {
      throw new HTTPError(
        404,
        null,
        { global_id: gid },
        "dia_00004040002",
        gid,
        securityKey
      );
    }
    return agent[0];
  } catch (err) {
    throw err;
  }
}

/**
 * Register an Agent to DIA.
 * Follow KISS principle, you need to make sure your **global_id** is unique.
 * Currently, **global_id** is only way for **Agent** Identity.
 * @param {object} Agent - Agent need to be register
 * @param {string} securityKey - The securityKey that previous service send, used to identify who send this request
 *
 * @returns {object}
 */
async function registerAgent(agent, securityKey) {
  try {
    // validate agent
    // TODO: change to validate based on schema
    if (
      !_.get(agent, "global_id") ||
      !_.get(agent, "name")
    ) {
      throw new HTTPError(400, null, {}, "dia_00134000001");
    }

    // TODO: Think about whether we need to support Dynamic Generate **global_id**.
    // Use global_id to find Agent.
    let agentInDB = await findOneByGlobalId(
      COLLECTIONS_NAME.agents,
      agent.global_id,
      {
        projection: {
          global_id: 1
        }
      }
    );
    // global_id must be unique
    if (agentInDB) {
      // global_id already exist
      throw new HTTPError(
        400,
        null,
        {
          global_id: agent.global_id
        },
        "dia_00134000001",
        agent.global_id
      );
    }

    // if securityKey exist, then add securityKey to agent
    if (securityKey) {
      agent[CONFIG.SECURITY_KEY_IN_DB] = securityKey;
    }

    let insertOneWriteOpResultObject = await insertOne(
      COLLECTIONS_NAME.agents,
      agent
    );
    return {
      _id: insertOneWriteOpResultObject.insertedId,
      global_id: agent.global_id
    };
  } catch (err) {
    // Already HTTPError, then throw it
    throw err;
  }
}

/**
 * OperationIndex: 0002
 * Get a Agent by global_id
 * @param {string} gid - global_id
 *
 * @returns {object}
 */
async function getAgent(gid, securityKey) {
  try {

    if (!gid) {
      throw new HTTPError(
        400,
        null,
        {
          global_id: gid
        },
        "dia_00024000001"
      );
    }
    let agent = await checkAgentExistByGlobalID(gid, securityKey);
    if (!agent) {
      throw new HTTPError(
        404,
        null,
        {
          global_id: gid
        },
        "dia_00024040001",
        gid
      );
    }
    return agent;
  } catch (err) {
    throw err;
  }
}

/**
 * OperationIndex: 0010
 * Get a Agents
 * @param {string} securityKey - global_id
 *
 * @returns {object}
 */
async function getAgents(securityKey) {
  try {
    let query = {};
    if (securityKey) {
      query[CONFIG.SECURITY_KEY_IN_DB] = {
        $eq: securityKey
      };
    }

    let agents = await find(COLLECTIONS_NAME.agents, query);
    return agents;
  } catch (err) {
    throw err;
  }
}

async function updateAgent(gid, agent, securityKey) {
  try {
    // Make sure can find Agent, if cannot, the it will throw 404 error
    await checkAgentExistByGlobalID(gid, securityKey);

    // Remove cannot update fields
    delete agent.created_at;
    delete agent._id;
    delete agent.global_id;

    let originalAgent = await getAgent(gid);
    let obj = _.merge({}, originalAgent, agent);
    obj.modified_at = Date.now();
    let result = await updateOne(
      COLLECTIONS_NAME.agents,
      {
        global_id: {
          $eq: gid
        }
      },
      {
        $set: obj
      }
    );
    return result;
  } catch (err) {
    throw err;
  }
}

async function updateAgentStatus(gid, originalAgent) {
  try {
    // if user didn't pass originalAgent, then get it
    if (!originalAgent) {
      originalAgent = await getAgent(gid);
    }
    // let agentStatusCheckTime = config.Agent_STATUS_CHECK_TIME;
    let agent = _.merge({}, DEFAULT_Agent, originalAgent);
    let status = await new Promise((resolve, reject) => {
      let headers = {};
      if (agent.api_key) {
        headers[constants.API_KEY_HEADER] = agent.api_key;
      }
      // send request
      axios({
        baseURL: agent.base_url,
        method: agent.health.method,
        url: agent.health.path,
        headers
      })
        .then(res => {
          resolve(true);
        })
        .catch(err => {
          // logger.warn("");
          // the reason of return [] is because, normally agent is automatically start and close, no human monitor it
          // to make sure work flow isn't stopped, so resolve it as []
          resolve(false);
        });
    });
    if (status) {
      originalAgent.status = "ACTIVE";
    } else {
      originalAgent.status = "INACTIVE";
    }
    originalAgent.modified_at = Date.now();
    let result = await updateMany(
      COLLECTIONS_NAME.intelligences,
      {
        "agent.global_id": {
          $eq: gid
        }
      },
      {
        $set: {
          "agent.status": originalAgent.status
        }
      }
    );
    result = await updateOne(
      COLLECTIONS_NAME.agents,
      {
        global_id: {
          $eq: gid
        }
      },
      {
        $set: originalAgent
      }
    );
    return {
      status: originalAgent.status
    };
  } catch (err) {
    throw err;
  }
}

async function unregisterAgent(gid, securityKey) {
  try {
    // Make sure can find Agent, if cannot, the it will throw 404 error
    await checkAgentExistByGlobalID(gid, securityKey);

    let query = {
      agent_gid: {
        $eq: gid
      }
    };

    if (securityKey) {
      query[CONFIG.SECURITY_KEY_IN_DB] = {
        $eq: securityKey
      };
    }
    // remove all intelligences that this agent created
    await remove(COLLECTIONS_NAME.intelligences, {
      query
    });

    let agentQuery = {
      global_id: {
        $eq: gid
      }
    };
    if (securityKey) {
      agentQuery[CONFIG.SECURITY_KEY_IN_DB] = {
        $eq: securityKey
      };
    }

    // remove this Agent in agents collection
    let result = await remove(COLLECTIONS_NAME.agents, agentQuery);
    return result;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  registerAgent,
  getAgent,
  updateAgent,
  unregisterAgent,
  updateAgentStatus,
  getAgents
};
