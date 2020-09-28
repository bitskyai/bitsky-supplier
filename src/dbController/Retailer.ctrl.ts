const _ = require("lodash");
import { getRepository, getMongoRepository } from "typeorm";
import Retailer from "../entity/Retailer";
import { isMongo } from "../util/dbConfiguration";
const logger = require("../util/logger");
const { HTTPError } = require("../util/error");

function flattenToObject(retailers) {
  function toObject(retailer) {
    if(!retailer){
      return retailer;
    }
    let obj: any = {};
    obj.globalId = _.get(retailer, "global_id");
    obj.name = _.get(retailer, "name");
    // obj.description = retailer.description;
    obj.baseURL = _.get(retailer, "base_url");
    if (_.get(retailer, "callback_method")) {
      !obj.callback ? (obj.callback = {}) : "";
      obj.callback.method = retailer.callback_method;
    }

    if (_.get(retailer, "callback_path")) {
      !obj.callback ? (obj.callback = {}) : "";
      obj.callback.path = retailer.callback_path;
    }
    if (_.get(retailer, "health_method")) {
      !obj.health ? (obj.health = {}) : "";
      obj.health.method = retailer.health_method;
    }

    if (_.get(retailer, "health_path")) {
      !obj.health ? (obj.health = {}) : "";
      obj.health.path = retailer.health_path;
    }

    if (_.get(retailer, "system_state")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.state = retailer.system_state;
    }

    if (_.get(retailer, "system_version")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.version = retailer.system_version;
    }

    if (_.get(retailer, "system_security_key")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.securityKey = retailer.system_security_key;
    }

    if (_.get(retailer, "system_created_at")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.created = retailer.system_created_at;
    }

    if (_.get(retailer, "system_modified_at")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.modified = retailer.system_modified_at;
    }

    if (_.get(retailer, "system_last_ping")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.lastPing = retailer.system_last_ping;
    }

    if (_.get(retailer, "system_ping_fail_reason")) {
      !obj.system ? (obj.system = {}) : "";
      obj.system.pingFailReason = retailer.system_ping_fail_reason;
    }

    return obj;
  }

  if (_.isArray(retailers)) {
    let arr = [];
    for (let i = 0; i < retailers.length; i++) {
      arr.push(toObject(retailers[i]));
    }
    return arr;
  } else {
    return toObject(retailers);
  }
}

function objectToRetailer(retailer, retailerInstance) {
  if (!retailerInstance) {
    retailerInstance = new Retailer();
  }
  if (_.get(retailer, "globalId")) {
    retailerInstance.global_id = retailer.globalId;
  }

  if (_.get(retailer, "name")) {
    retailerInstance.name = retailer.name;
  }

  // if (_.get(retailer, "description")) {
  //   retailerInstance.description = retailer.description;
  // }

  if (_.get(retailer, "baseURL")) {
    retailerInstance.base_url = retailer.baseURL;
  }

  if (_.get(retailer, "callback.method")) {
    retailerInstance.callback_method = retailer.callback.method;
  }

  if (_.get(retailer, "callback.path")) {
    retailerInstance.callback_path = retailer.callback.path;
  }

  if (_.get(retailer, "health.method")) {
    retailerInstance.health_method = retailer.health.method;
  }

  if (_.get(retailer, "health.path")) {
    retailerInstance.health_path = retailer.health.path;
  }

  if (_.get(retailer, "system.state")) {
    retailerInstance.system_state = retailer.system.state;
  }

  if (_.get(retailer, "system.version")) {
    retailerInstance.system_version = retailer.system.version;
  }

  if (_.get(retailer, "system.securityKey")) {
    retailerInstance.system_security_key = retailer.system.securityKey;
  }

  if (_.get(retailer, "system.created")) {
    retailerInstance.system_created_at = retailer.system.created;
  }

  if (_.get(retailer, "system.modified")) {
    retailerInstance.system_modified_at = retailer.system.modified;
  }

  if (_.get(retailer, "system.lastPing")) {
    retailerInstance.system_last_ping = retailer.system.lastPing;
  }

  if (_.get(retailer, "system.pingFailReason")) {
    retailerInstance.system_ping_fail_reason = retailer.system.pingFailReason;
  }else{
    retailerInstance.system_ping_fail_reason = '';
  }

  return retailerInstance;
}

export async function addRetailerDB(retailer) {
  try {
    const repo = getRepository(Retailer);
    let retailerInstance = objectToRetailer(retailer, null);

    await repo.save(retailerInstance);
    return {
      _id: retailerInstance.id,
      globalId: retailerInstance.global_id,
    };
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Retailer.ctrl->addRetailerDB"
    );
    logger.error(`addRetailerDB, error:${error.message}`, { error });
    throw error;
  }
}

export async function getRetailersDB(securityKey?: string) {
  try {
    const repo = getRepository(Retailer);
    let query: any = {};
    if (securityKey) {
      query.system_security_key = securityKey;
    }
    let retailers = await repo.find(query);
    retailers = flattenToObject(retailers);
    return retailers;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Retailer.ctrl->getRetailersDB"
    );
    logger.error(`getRetailersDB, error:${error.message}`, { error });
    throw error;
  }
}

export async function getNeedCheckHealthRetailersDB(
  lastPing: number,
  securityKey?: string
) {
  try {
    let retailers = [];
    if (isMongo()) {
      const repo = await getMongoRepository(Retailer);
      let query: any = {
        system_last_ping: {
          $lt: lastPing,
        },
      };

      if (securityKey) {
        query.system_security_key = securityKey;
      }

      retailers = await repo.find(query);
    } else {
      // SQL
      const retailersQuery = await getRepository(Retailer)
        .createQueryBuilder()
        .where("system_last_ping < :lastPing", {
          lastPing,
        });

      if (securityKey) {
        retailersQuery.andWhere("system_security_key = :securityKey", {
          securityKey,
        });
      }
      retailers = await retailersQuery.getMany();
    }
    retailers = flattenToObject(retailers);
    return retailers;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Retailer.ctrl->getNeedCheckHealthRetailersDB"
    );
    logger.error(`getNeedCheckHealthRetailersDB, error:${error.message}`, { error });
    throw error;
  }
}

export async function getRetailerByGlobalIdDB(gid: string, securityKey: string) {
  try {
    const repo = getRepository(Retailer);
    let query: any = {
      global_id: gid,
    };
    if (securityKey) {
      query.system_security_key = securityKey;
    }
    let retailer = await repo.findOne(query);
    retailer = flattenToObject(retailer);
    return retailer;
  } catch (err) {
    let error = new HTTPError(
      404,
      err,
      {
        globalId: gid
      },
      "00004040001",
      gid,
      securityKey
    );
    logger.error(`getRetailerByGlobalIdDB, error:${error.message}`, { error });
    throw error;
  }
}

export async function updateRetailerDB(gid, securityKey, retailer) {
  try {
    let query: any = {
      global_id: gid,
    };
    if (securityKey) {
      query.system_security_key = securityKey;
    }
    const repo = getRepository(Retailer);
    retailer = objectToRetailer(retailer, {});
    let result = await repo.update(query, retailer);
    return result;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Retailer.ctrl->updateRetailerDB"
    );
    logger.error(`updateRetailerDB, error:${error.message}`, { error });
    throw error;
  }
}

export async function deleteRetailerDB(gid: string, securityKey: string) {
  try {
    let query: any = {
      global_id: gid,
    };
    if (securityKey) {
      query.system_security_key = securityKey;
    }
    const repo = getRepository(Retailer);
    let result = await repo.delete(query);
    return result;
  } catch (err) {
    let error = new HTTPError(
      500,
      err,
      {},
      "00005000001",
      "Retailer.ctrl->deleteRetailerDB"
    );
    logger.error(`deleteRetailerDB, error:${error.message}`, { error });
    throw error;
  }
}
