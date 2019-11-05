const _ = require('lodash');
import { getRepository } from "typeorm";
import Agent from "../entity/Agent";
const logger = require("../util/logger");
const { HTTPError } = require("../util/error");

export async function addAgent(agent) {
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

    if(_.get(agent, 'health.method')){
      agentInstance.health_method = agent.health.method;
    }
  
    if(_.get(agent, 'health.path')){
      agentInstance.health_path = agent.health.path;
    }
  
    if(_.get(agent, 'system.state')){
      agentInstance.system_state = agent.system.state;
    }
  
    if(_.get(agent, 'system.version')){
      agentInstance.system_version = agent.system.version;
    }
  
    if(_.get(agent, 'system.securityKey')){
      agentInstance.system_security_key = agent.system.securityKey;
    }
  
    if(_.get(agent, 'system.created')){
      agentInstance.system_created_at = agent.system.created;
    }
  
    if(_.get(agent, 'system.modified')){
      agentInstance.system_modified_at = agent.system.modified;
    }
  
    if(_.get(agent, 'system.lastPing')){
      agentInstance.system_last_ping = agent.system.lastPing;
    }

    console.log('agentInstance: ', agentInstance);

    await repo.save(agentInstance);
    return {
      _id: agentInstance.id,
      globalId: agentInstance.global_id
    }
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
