const _ = require("lodash");
import { getRepository } from "typeorm";
import Agent from "../entity/Agent";
const logger = require("../util/logger");
const { HTTPError } = require("../util/error");

function flattenToObject(agents) {
  function toObject(producer) {
    let obj: any = {};
    obj.globalId = producer.global_id;
    obj.type = producer.type;
    obj.name = producer.name;
    obj.description = producer.description;
    obj.private = producer.private;
    obj.permission = producer.permission;
    obj.concurrent = producer.concurrent;
    obj.pollingInterval = producer.polling_interval;
    obj.maxWaitingTime = producer.max_waiting_time;
    obj.maxCollect = producer.max_collect;
    obj.idelTime = producer.idel_time;
    obj.timeout = producer.timeout;
    obj.maxRetry = producer.max_retry;
    obj.baseURL = producer.base_url;
    if (_.get(producer, "health_method")) {
      !obj.health ? (obj.health = {}) : "";
      obj.health.method = producer.health_method;
    }

    if (_.get(producer, "health_path")) {
      !obj.health ? (obj.health = {}) : "";
      obj.health.path = producer.health_path;
    }

    if (_.get(producer, "system_state")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.state = producer.system_state;
    }

    if (_.get(producer, "system_version")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.version = producer.system_version;
    }

    if (_.get(producer, "system_security_key")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.securityKey = producer.system_security_key;
    }

    if (_.get(producer, "system_created_at")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.created = producer.system_created_at;
    }

    if (_.get(producer, "system_modified_at")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.modified = producer.system_modified_at;
    }

    if (_.get(producer, "system_last_ping")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.lastPing = producer.system_last_ping;
    }

    if (_.get(producer, "system_serial_id")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.serialId = producer.system_serial_id;
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
 * @param producer{object} - the producer object
 */
function objectToAgent(producer, agentInstance) {
  if (!agentInstance) {
    agentInstance = new Agent();
  }
  if (_.get(producer, "globalId")) {
    agentInstance.global_id = producer.globalId;
  }
  if (_.get(producer, "type")) {
    agentInstance.type = producer.type;
  }
  if (_.get(producer, "name")) {
    agentInstance.name = producer.name;
  }
  if (_.get(producer, "description")) {
    agentInstance.description = producer.description;
  }
  if (_.get(producer, "private")) {
    agentInstance.private = producer.private;
  }
  if (_.get(producer, "permission")) {
    agentInstance.permission = producer.permission;
  }
  if (_.get(producer, "concurrent")) {
    agentInstance.concurrent = producer.concurrent;
  }
  if (_.get(producer, "pollingInterval")) {
    agentInstance.polling_interval = producer.pollingInterval;
  }
  if (_.get(producer, "maxWaitingTime")) {
    agentInstance.max_waiting_time = producer.maxWaitingTime;
  }
  if (_.get(producer, "maxCollect")) {
    agentInstance.max_collect = producer.maxCollect;
  }
  if (_.get(producer, "idelTime")) {
    agentInstance.idel_time = producer.idelTime;
  }
  if (_.get(producer, "timeout")) {
    agentInstance.timeout = producer.timeout;
  }
  if (_.get(producer, "maxRetry")) {
    agentInstance.max_retry = producer.maxRetry;
  }
  if (_.get(producer, "baseURL")) {
    agentInstance.base_url = producer.baseURL;
  }
  if (_.get(producer, "health.method")) {
    agentInstance.health_method = producer.health.method;
  }

  if (_.get(producer, "health.path")) {
    agentInstance.health_path = producer.health.path;
  }

  if (_.get(producer, "system.state")) {
    agentInstance.system_state = producer.system.state;
  }

  if (_.get(producer, "system.version")) {
    agentInstance.system_version = producer.system.version;
  }

  if (_.get(producer, "system.securityKey")) {
    agentInstance.system_security_key = producer.system.securityKey;
  }else{
    if(_.get(producer, "system.securityKey") !== undefined){
      agentInstance.system_security_key = null;
    }
  }

  if (_.get(producer, "system.created")) {
    agentInstance.system_created_at = producer.system.created;
  }else{
    if(_.get(producer, "system.created") !== undefined){
      agentInstance.system_created_at = null;
    }
  }

  if (_.get(producer, "system.modified")) {
    agentInstance.system_modified_at = producer.system.modified;
  }else{
    if(_.get(producer, "system.modified") !== undefined){
      agentInstance.system_modified_at = null;
    }
  }

  if (_.get(producer, "system.lastPing")) {
    agentInstance.system_last_ping = producer.system.lastPing;
  }else{
    if(_.get(producer, "system.lastPing") !== undefined){
      agentInstance.system_last_ping = null;
    }
  }

  if (_.get(producer, "system.serialId")) {
    agentInstance.system_serial_id = producer.system.serialId;
  }else{
    if(_.get(producer, "system.serialId") !== undefined){
      agentInstance.system_serial_id = null;
    }
  }

  return agentInstance;
}

export async function addAgentDB(producer) {
  try {
    const repo = getRepository(Agent);
    let agentInstance = objectToAgent(producer, null);
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
    let producer = await repo.findOne(query);
    if (!producer) {
      throw new HTTPError(404, null, { globalId: gid });
    }
    producer = flattenToObject(producer);
    return producer;
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
    //   logger.info(`getAgentByGlobalIdDB, cannot find producer by globalId - ${gid}`);
    // }else{
    //   logger.error(`getAgentByGlobalIdDB, error: ${err.message}`, {error: err});
    // }
    throw err;
  }
}

export async function updateAgentDB(gid, securityKey, producer) {
  try {
    if(!producer||!gid){
      // if producer doesn't exist or gid doesn't exist, don't need to update
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

    if(!producer.system){
      producer.system = {};
    }

    // update last modified
    producer.system.modified = Date.now();
    producer = objectToAgent(producer, {});

    // console.log(`updateAgentDB->producer: `, producer);

    const result = await repo.update(query, producer);
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
