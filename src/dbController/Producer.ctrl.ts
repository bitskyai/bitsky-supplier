const _ = require("lodash");
import { getRepository } from "typeorm";
import Producer from "../entity/Producer";
const logger = require("../util/logger");
const { HTTPError } = require("../util/error");

function flattenToObject(producers) {
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

  if (_.isArray(producers)) {
    let arr = [];
    for (let i = 0; i < producers.length; i++) {
      arr.push(toObject(producers[i]));
    }
    return arr;
  } else {
    return toObject(producers);
  }
}

/**
 *
 * @param producer{object} - the producer object
 */
function objectToProducer(producer, producerInstance) {
  if (!producerInstance) {
    producerInstance = new Producer();
  }
  if (_.get(producer, "globalId")) {
    producerInstance.global_id = producer.globalId;
  }
  if (_.get(producer, "type")) {
    producerInstance.type = producer.type;
  }
  if (_.get(producer, "name")) {
    producerInstance.name = producer.name;
  }
  if (_.get(producer, "description")) {
    producerInstance.description = producer.description;
  }
  if (_.get(producer, "private")) {
    producerInstance.private = producer.private;
  }
  if (_.get(producer, "permission")) {
    producerInstance.permission = producer.permission;
  }
  if (_.get(producer, "concurrent")) {
    producerInstance.concurrent = producer.concurrent;
  }
  if (_.get(producer, "pollingInterval")) {
    producerInstance.polling_interval = producer.pollingInterval;
  }
  if (_.get(producer, "maxWaitingTime")) {
    producerInstance.max_waiting_time = producer.maxWaitingTime;
  }
  if (_.get(producer, "maxCollect")) {
    producerInstance.max_collect = producer.maxCollect;
  }
  if (_.get(producer, "idelTime")) {
    producerInstance.idel_time = producer.idelTime;
  }
  if (_.get(producer, "timeout")) {
    producerInstance.timeout = producer.timeout;
  }
  if (_.get(producer, "maxRetry")) {
    producerInstance.max_retry = producer.maxRetry;
  }
  if (_.get(producer, "baseURL")) {
    producerInstance.base_url = producer.baseURL;
  }
  if (_.get(producer, "health.method")) {
    producerInstance.health_method = producer.health.method;
  }

  if (_.get(producer, "health.path")) {
    producerInstance.health_path = producer.health.path;
  }

  if (_.get(producer, "system.state")) {
    producerInstance.system_state = producer.system.state;
  }

  if (_.get(producer, "system.version")) {
    producerInstance.system_version = producer.system.version;
  }

  if (_.get(producer, "system.securityKey")) {
    producerInstance.system_security_key = producer.system.securityKey;
  }else{
    if(_.get(producer, "system.securityKey") !== undefined){
      producerInstance.system_security_key = null;
    }
  }

  if (_.get(producer, "system.created")) {
    producerInstance.system_created_at = producer.system.created;
  }else{
    if(_.get(producer, "system.created") !== undefined){
      producerInstance.system_created_at = null;
    }
  }

  if (_.get(producer, "system.modified")) {
    producerInstance.system_modified_at = producer.system.modified;
  }else{
    if(_.get(producer, "system.modified") !== undefined){
      producerInstance.system_modified_at = null;
    }
  }

  if (_.get(producer, "system.lastPing")) {
    producerInstance.system_last_ping = producer.system.lastPing;
  }else{
    if(_.get(producer, "system.lastPing") !== undefined){
      producerInstance.system_last_ping = null;
    }
  }

  if (_.get(producer, "system.serialId")) {
    producerInstance.system_serial_id = producer.system.serialId;
  }else{
    if(_.get(producer, "system.serialId") !== undefined){
      producerInstance.system_serial_id = null;
    }
  }

  return producerInstance;
}

export async function addProducerDB(producer) {
  try {
    const repo = getRepository(Producer);
    let producerInstance = objectToProducer(producer, null);
    console.log("producerInstance: ", producerInstance);
    await repo.save(producerInstance);
    return {
      _id: producerInstance.id,
      globalId: producerInstance.global_id,
    };
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Producer.ctrl->addProducerDB"
    );
    logger.error("addProducerDB, error:", error);
    throw error;
  }
}

export async function getProducersDB(securityKey: string) {
  try {
    const repo = getRepository(Producer);
    let query: any = {};
    if (securityKey) {
      query.system_security_key = securityKey;
    }
    let producers = await repo.find(query);
    producers = flattenToObject(producers);
    return producers;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Producer.ctrl->getProducersDB"
    );
    logger.error("getProducersDB, error:", error);
    throw error;
  }
}

export async function getProducerByGlobalIdDB(gid: string, securityKey: string) {
  try {
    const repo = getRepository(Producer);
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
        "Producer.ctrl->getProducerByGlobalIdDB"
      );
    }
    // if(err.statusCode === 404){
    //   logger.info(`getProducerByGlobalIdDB, cannot find producer by globalId - ${gid}`);
    // }else{
    //   logger.error(`getProducerByGlobalIdDB, error: ${err.message}`, {error: err});
    // }
    throw err;
  }
}

export async function updateProducerDB(gid, securityKey, producer) {
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
    const repo = getRepository(Producer);

    if(!producer.system){
      producer.system = {};
    }

    // update last modified
    producer.system.modified = Date.now();
    producer = objectToProducer(producer, {});

    // console.log(`updateProducerDB->producer: `, producer);

    const result = await repo.update(query, producer);
    return result;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Producer.ctrl->updateProducerDB"
    );
    logger.error("updateProducerDB, error:", error);
    throw error;
  }
}

export async function deleteProducerDB(gid: string, securityKey: string) {
  try {
    let query: any = {
      global_id: gid,
    };
    if (securityKey) {
      query.system_security_key = securityKey;
    }
    const repo = getRepository(Producer);
    let result = await repo.delete(query);
    return result;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Producer.ctrl->deleteProducerDB"
    );
    logger.error("deleteProducerDB, error:", error);
    throw error;
  }
}
