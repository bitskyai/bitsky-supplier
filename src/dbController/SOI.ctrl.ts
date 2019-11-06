const _ = require("lodash");
import { getRepository } from "typeorm";
import SOI from "../entity/SOI";
const logger = require("../util/logger");
const { HTTPError } = require("../util/error");

function flattenToObject(sois) {
  function toObject(soi) {
    let obj: any = {};
    obj.globalId = soi.global_id;
    obj.type = soi.type;
    obj.name = soi.name;
    obj.description = soi.description;
    obj.baseURL = soi.base_url;
    if (_.get(soi, "callback_method")) {
      !obj.callback ? (obj.callback = {}) : "";
      obj.callback.method = soi.callback_method;
    }

    if (_.get(soi, "callback_path")) {
      !obj.callback ? (obj.callback = {}) : "";
      obj.callback.path = soi.callback_path;
    }
    if (_.get(soi, "health_method")) {
      !obj.health ? (obj.health = {}) : "";
      obj.health.method = soi.health_method;
    }

    if (_.get(soi, "health_path")) {
      !obj.health ? (obj.health = {}) : "";
      obj.health.path = soi.health_path;
    }

    if (_.get(soi, "system_state")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.state = soi.system_state;
    }

    if (_.get(soi, "system_version")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.version = soi.system_version;
    }

    if (_.get(soi, "system_security_key")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.securityKey = soi.system_security_key;
    }

    if (_.get(soi, "system_created_at")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.created = soi.system_created_at;
    }

    if (_.get(soi, "system_modified_at")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.modified = soi.system_modified_at;
    }

    if (_.get(soi, "system_last_ping")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.lastPing = soi.system_last_ping;
    }

    if (_.get(soi, "system_ping_fail_reason")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.pingFailReason = soi.system_ping_fail_reason;
    }

    return obj;
  }

  if (_.isArray(sois)) {
    let arr = [];
    for (let i = 0; i < sois.length; i++) {
      arr.push(toObject(sois[i]));
    }
    return arr;
  } else {
    return toObject(sois);
  }
}

function objectToSOI(soi, soiInstance) {
  console.log('=====================');
  console.log(soi);
  if (!soiInstance) {
    soiInstance = new SOI();
  }
  if (_.get(soi, "globalId")) {
    soiInstance.global_id = soi.globalId;
  }

  if (_.get(soi, "name")) {
    soiInstance.name = soi.name;
  }

  if (_.get(soi, "description")) {
    soiInstance.description = soi.description;
  }

  if (_.get(soi, "baseURL")) {
    soiInstance.base_url = soi.baseURL;
  }

  if (_.get(soi, "callback.method")) {
    soiInstance.callback_method = soi.callback.method;
  }

  if (_.get(soi, "callback.path")) {
    soiInstance.callback_path = soi.callback.path;
  }

  if (_.get(soi, "health.method")) {
    soiInstance.health_method = soi.health.method;
  }

  if (_.get(soi, "health.path")) {
    soiInstance.health_path = soi.health.path;
  }

  if (_.get(soi, "system.state")) {
    soiInstance.system_state = soi.system.state;
  }

  if (_.get(soi, "system.version")) {
    soiInstance.system_version = soi.system.version;
  }

  if (_.get(soi, "system.securityKey")) {
    soiInstance.system_security_key = soi.system.securityKey;
  }

  if (_.get(soi, "system.created")) {
    soiInstance.system_created_at = soi.system.created;
  }

  if (_.get(soi, "system.modified")) {
    soiInstance.system_modified_at = soi.system.modified;
  }

  if (_.get(soi, "system.lastPing")) {
    soiInstance.system_last_ping = soi.system.lastPing;
  }

  if (_.get(soi, "system.pingFailReason")) {
    soiInstance.system_ping_fail_reason = soi.system.pingFailReason;
  }

  return soiInstance;
}

export async function addSOIDB(soi) {
  try {
    const repo = getRepository(SOI);
    let soiInstance = objectToSOI(soi, null);

    await repo.save(soiInstance);
    return {
      _id: soiInstance.id,
      globalId: soiInstance.global_id
    };
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "SOI.ctrl->addSOIDB"
    );
    logger.error("addSOIDB, error:", error);
    throw error;
  }
}

export async function getSOIsDB(securityKey: string) {
  try {
    const repo = getRepository(SOI);
    let query: any = {};
    if (securityKey) {
      query.system_security_key = securityKey;
    }
    let sois = await repo.find(query);
    sois = flattenToObject(sois);
    return sois;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "SOI.ctrl->getSOIsDB"
    );
    logger.error("getSOIsDB, error:", error);
    throw error;
  }
}

export async function getSOIByGlobalIdDB(gid: string, securityKey: string) {
  try {
    const repo = getRepository(SOI);
    let query: any = {
      global_id: gid
    };
    if (securityKey) {
      query.system_security_key = securityKey;
    }
    let soi = await repo.findOne(query);
    soi = flattenToObject(soi);
    return soi;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "SOI.ctrl->getSOIByGlobalIdDB"
    );
    logger.error("getSOIByGlobalIdDB, error:", error);
    throw error;
  }
}

export async function updateSOIDB(gid, securityKey, soi) {
  try {
    let query: any = {
      global_id: gid
    };
    if (securityKey) {
      query.system_security_key = securityKey;
    }
    const repo = getRepository(SOI);
    soi = objectToSOI(soi, {});
    let result = await repo.update(query, soi);
    return result;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "SOI.ctrl->updateSOIDB"
    );
    logger.error("updateSOIDB, error:", error);
    throw error;
  }
}

export async function deleteSOIDB(gid: string, securityKey: string) {
  try {
    let query: any = {
      global_id: gid
    };
    if (securityKey) {
      query.system_security_key = securityKey;
    }
    const repo = getRepository(SOI);
    let result = await repo.delete(query);
    return result;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "SOI.ctrl->deleteSOIDB"
    );
    logger.error("deleteSOIDB, error:", error);
    throw error;
  }
}
