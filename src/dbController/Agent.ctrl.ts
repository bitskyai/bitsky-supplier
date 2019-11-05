const _ = require('lodash');
import { getRepository } from "typeorm";
import Agent from "../entity/Agent";
const logger = require("../util/logger");
const { HTTPError } = require("../util/error");

function flattenAgent(agent){
  if(_.get(agent, 'health.method')){
    agent.healthMethod = agent.health.method;
  }

  if(_.get(agent, 'health.path')){
    agent.healthPath = agent.health.path;
  }

  if(_.get(agent, 'system.state')){
    agent.systemState = agent.system.state;
  }

  if(_.get(agent, 'system.version')){
    agent.systemVersion = agent.system.version;
  }

  if(_.get(agent, 'system.securityKey')){
    agent.systemSecurityKey = agent.system.securityKey;
  }

  if(_.get(agent, 'system.created')){
    agent.systemCreatedAt = agent.system.created;
  }

  if(_.get(agent, 'system.modified')){
    agent.systemModifiedAt = agent.system.modified;
  }

  if(_.get(agent, 'system.lastPing')){
    agent.systemLastPing = agent.system.lastPing;
  }

  delete agent.system;
  delete agent.health;

  return agent;
}

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
    agentInstance.pollingInterval = agent.pollingInterval;
    agentInstance.maxWaitingTime = agent.maxWaitingTime;
    agentInstance.maxCollect = agent.maxCollect;
    agentInstance.idelTime = agent.idelTime;
    agentInstance.timeout = agent.timeout;
    agentInstance.maxRetry = agent.maxRetry;
    agentInstance.baseURL = agent.baseURL;

    if(_.get(agent, 'health.method')){
      agentInstance.healthMethod = agent.health.method;
    }
  
    if(_.get(agent, 'health.path')){
      agentInstance.healthPath = agent.health.path;
    }
  
    if(_.get(agent, 'system.state')){
      agentInstance.systemState = agent.system.state;
    }
  
    if(_.get(agent, 'system.version')){
      agentInstance.systemVersion = agent.system.version;
    }
  
    if(_.get(agent, 'system.securityKey')){
      agentInstance.systemSecurityKey = agent.system.securityKey;
    }
  
    if(_.get(agent, 'system.created')){
      agentInstance.systemCreatedAt = agent.system.created;
    }
  
    if(_.get(agent, 'system.modified')){
      agentInstance.systemModifiedAt = agent.system.modified;
    }
  
    if(_.get(agent, 'system.lastPing')){
      agentInstance.systemLastPing = agent.system.lastPing;
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
