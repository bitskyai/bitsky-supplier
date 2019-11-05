const _ = require("lodash");
import { getRepository, FindOperator } from "typeorm";
import Agent from "../entity/Agent";
const logger = require("../util/logger");
const { HTTPError } = require("../util/error");

function flattenToObject(agents) {
  function toObject(agent) {
    let obj: any = {};
    obj.globalId = agent.global_id;
    obj.type = agent.type;
    obj.name = agent.name;
    obj.description = agent.description;
    obj.permission = agent.permission;
    obj.concurrent = agent.concurrent;
    obj.pollingInterval = agent.polling_interval;
    obj.maxWaitingTime = agent.max_waiting_time;
    obj.maxCollect = agent.max_collect;
    obj.idelTime = agent.idel_time;
    obj.timeout = agent.timeout;
    obj.maxRetry = agent.max_retry;
    obj.baseURL = agent.base_url;
    if (_.get(agent, "health_method")) {
      !obj.health ? (obj.health = {}) : "";
      obj.health.method = agent.health_method;
    }

    if (_.get(agent, "health_path")) {
      !obj.health ? (obj.health = {}) : "";
      obj.health.path = agent.health_path;
    }

    if (_.get(agent, "system_state")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.state = agent.system_state;
    }

    if (_.get(agent, "system_version")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.version = agent.system_version;
    }

    if (_.get(agent, "system_security_key")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.securityKey = agent.system_security_key;
    }

    if (_.get(agent, "system_created_at")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.created = agent.system_created_at;
    }

    if (_.get(agent, "system_modified_at")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.modified = agent.system_modified_at;
    }

    if (_.get(agent, "system_last_ping")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.lastPing = agent.system_last_ping;
    }

    return obj;
  }

  if (_.isArray(agents)) {
    let arr = [];
    for (let i = 0; i < agents.length; i++) {
      arr.push(toObject(agents[i]));
    }
    return arr;
  } else {
    return toObject(agents);
  }
}

export async function addAgentDB(agent) {
  try {
    const repo = getRepository(Agent);
    let agentInstance = new Agent();
    agentInstance.global_id = agent.globalId;
    agentInstance.type = agent.type;
    agentInstance.name = agent.name;
    agentInstance.description = agent.description;
    agentInstance.permission = agent.permission;
    agentInstance.concurrent = agent.concurrent;
    agentInstance.polling_interval = agent.pollingInterval;
    agentInstance.max_waiting_time = agent.maxWaitingTime;
    agentInstance.max_collect = agent.maxCollect;
    agentInstance.idel_time = agent.idelTime;
    agentInstance.timeout = agent.timeout;
    agentInstance.max_retry = agent.maxRetry;
    agentInstance.base_url = agent.baseURL;

    if (_.get(agent, "health.method")) {
      agentInstance.health_method = agent.health.method;
    }

    if (_.get(agent, "health.path")) {
      agentInstance.health_path = agent.health.path;
    }

    if (_.get(agent, "system.state")) {
      agentInstance.system_state = agent.system.state;
    }

    if (_.get(agent, "system.version")) {
      agentInstance.system_version = agent.system.version;
    }

    if (_.get(agent, "system.securityKey")) {
      agentInstance.system_security_key = agent.system.securityKey;
    }

    if (_.get(agent, "system.created")) {
      agentInstance.system_created_at = agent.system.created;
    }

    if (_.get(agent, "system.modified")) {
      agentInstance.system_modified_at = agent.system.modified;
    }

    if (_.get(agent, "system.lastPing")) {
      agentInstance.system_last_ping = agent.system.lastPing;
    }

    console.log("agentInstance: ", agentInstance);

    await repo.save(agentInstance);
    return {
      _id: agentInstance.id,
      globalId: agentInstance.global_id
    };
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Agent.ctrl->addAgent"
    );
    logger.error("addAgent, error:", error);
    throw error;
  }
}

export async function getAgentsDB(securityKey) {
  try {
    const repo = getRepository(Agent);
    let query: any = {};
    if (securityKey) {
      query.system_security_key = securityKey;
    }
    let agents = await repo.find(query);
    agents = flattenToObject(agents);
    return agents;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Agent.ctrl->getAgents"
    );
    logger.error("getAgents, error:", error);
    throw error;
  }
}

// export async function addAgent() {
//   try {
//     const repo = getRepository(Agent);
//   } catch (err) {
//     let error = new HTTPError(
//       500,
//       err,
//       {},
//       "00005000001",
//       "Agent.ctrl->addAgent"
//     );
//     logger.error("addAgent, error:", error);
//     throw error;
//   }
// }
