const _ = require("lodash");
import { getRepository } from "typeorm";
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
    obj.private = agent.private;
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

    if (_.get(agent, "system_serial_id")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.serialId = agent.system_serial_id;
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

/**
 *
 * @param agent{object} - the agent object
 */
function objectToAgent(agent, agentInstance) {
  if (!agentInstance) {
    agentInstance = new Agent();
  }
  if (_.get(agent, "globalId")) {
    agentInstance.global_id = agent.globalId;
  }
  if (_.get(agent, "type")) {
    agentInstance.type = agent.type;
  }
  if (_.get(agent, "name")) {
    agentInstance.name = agent.name;
  }
  if (_.get(agent, "description")) {
    agentInstance.description = agent.description;
  }
  if (_.get(agent, "private")) {
    agentInstance.private = agent.private;
  }
  if (_.get(agent, "permission")) {
    agentInstance.permission = agent.permission;
  }
  if (_.get(agent, "concurrent")) {
    agentInstance.concurrent = agent.concurrent;
  }
  if (_.get(agent, "pollingInterval")) {
    agentInstance.polling_interval = agent.pollingInterval;
  }
  if (_.get(agent, "maxWaitingTime")) {
    agentInstance.max_waiting_time = agent.maxWaitingTime;
  }
  if (_.get(agent, "maxCollect")) {
    agentInstance.max_collect = agent.maxCollect;
  }
  if (_.get(agent, "idelTime")) {
    agentInstance.idel_time = agent.idelTime;
  }
  if (_.get(agent, "timeout")) {
    agentInstance.timeout = agent.timeout;
  }
  if (_.get(agent, "maxRetry")) {
    agentInstance.max_retry = agent.maxRetry;
  }
  if (_.get(agent, "baseURL")) {
    agentInstance.base_url = agent.baseURL;
  }
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
  }else{
    if(_.get(agent, "system.securityKey") !== undefined){
      agentInstance.system_security_key = null;
    }
  }

  if (_.get(agent, "system.created")) {
    agentInstance.system_created_at = agent.system.created;
  }else{
    if(_.get(agent, "system.created") !== undefined){
      agentInstance.system_created_at = null;
    }
  }

  if (_.get(agent, "system.modified")) {
    agentInstance.system_modified_at = agent.system.modified;
  }else{
    if(_.get(agent, "system.modified") !== undefined){
      agentInstance.system_modified_at = null;
    }
  }

  if (_.get(agent, "system.lastPing")) {
    agentInstance.system_last_ping = agent.system.lastPing;
  }else{
    if(_.get(agent, "system.lastPing") !== undefined){
      agentInstance.system_last_ping = null;
    }
  }

  if (_.get(agent, "system.serialId")) {
    agentInstance.system_serial_id = agent.system.serialId;
  }else{
    if(_.get(agent, "system.serialId") !== undefined){
      agentInstance.system_serial_id = null;
    }
  }

  return agentInstance;
}

export async function addAgentDB(agent) {
  try {
    const repo = getRepository(Agent);
    let agentInstance = objectToAgent(agent, null);
    console.log("agentInstance: ", agentInstance);
    await repo.save(agentInstance);
    return {
      _id: agentInstance.id,
      globalId: agentInstance.global_id,
    };
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Agent.ctrl->addAgentDB"
    );
    logger.error("addAgentDB, error:", error);
    throw error;
  }
}

export async function getAgentsDB(securityKey: string) {
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
      "Agent.ctrl->getAgentsDB"
    );
    logger.error("getAgentsDB, error:", error);
    throw error;
  }
}

export async function getAgentByGlobalIdDB(gid: string, securityKey: string) {
  try {
    const repo = getRepository(Agent);
    let query: any = {
      global_id: gid,
    };
    if (securityKey) {
      query.system_security_key = securityKey;
    }
    let agent = await repo.findOne(query);
    if (!agent) {
      throw new HTTPError(404, null, { globalId: gid });
    }
    agent = flattenToObject(agent);
    return agent;
  } catch (err) {
    if(!(err instanceof HTTPError)){
      err = new HTTPError(
        500,
        err,
        {},
        "00005000001",
        "Agent.ctrl->getAgentByGlobalIdDB"
      );
    }
    // if(err.statusCode === 404){
    //   logger.info(`getAgentByGlobalIdDB, cannot find agent by globalId - ${gid}`);
    // }else{
    //   logger.error(`getAgentByGlobalIdDB, error: ${err.message}`, {error: err});
    // }
    throw err;
  }
}

export async function updateAgentDB(gid, securityKey, agent) {
  try {
    if(!agent||!gid){
      // if agent doesn't exist or gid doesn't exist, don't need to update
      return {
        gid: gid
      };
    }

    let query: any = {
      global_id: gid,
    };
    if (securityKey) {
      query.system_security_key = securityKey;
    }
    const repo = getRepository(Agent);

    if(!agent.system){
      agent.system = {};
    }

    // update last modified
    agent.system.modified = Date.now();
    agent = objectToAgent(agent, {});

    // console.log(`updateAgentDB->agent: `, agent);

    const result = await repo.update(query, agent);
    return result;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Agent.ctrl->updateAgentDB"
    );
    logger.error("updateAgentDB, error:", error);
    throw error;
  }
}

export async function deleteAgentDB(gid: string, securityKey: string) {
  try {
    let query: any = {
      global_id: gid,
    };
    if (securityKey) {
      query.system_security_key = securityKey;
    }
    const repo = getRepository(Agent);
    let result = await repo.delete(query);
    return result;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Agent.ctrl->deleteAgentDB"
    );
    logger.error("deleteAgentDB, error:", error);
    throw error;
  }
}
