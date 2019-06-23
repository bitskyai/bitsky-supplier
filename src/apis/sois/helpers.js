const _ = require("lodash");
const axios = require("axios");
const {
  CONFIG,
  DEFAULT_SOI,
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

async function checkSOIExistByGlobalID(gid, securityKey) {
  try {
    let soiQuery = {
      global_id: {
        $eq: gid
      }
    };
    if (securityKey) {
      soiQuery[CONFIG.SECURITY_KEY_IN_DB] = {
        $eq: securityKey
      };
    }

    let soi = await find(COLLECTIONS_NAME.sois, soiQuery);

    // soi doesn't exist
    if (!soi || !soi.length) {
      throw new HTTPError(
        404,
        null,
        { global_id: gid },
        "dia_00004040001",
        gid,
        securityKey
      );
    }
    return soi[0];
  } catch (err) {
    throw err;
  }
}

/**
 * OperationIndex: 0001
 * Register a SOI to DIA.
 * Follow KISS principle, you need to make sure your **global_id** is unique.
 * Currently, **global_id** is only way for **SOI** Identity.
 * @param {object} soi - SOI need to be register
 * @param {string} securityKey - The securityKey that previous service send, used to identify who send this request
 *
 * @returns {object}
 */
async function registerSOI(soi, securityKey) {
  try {
    // validate soi
    // TODO: change to validate based on schema
    if (
      !_.get(soi, "global_id") ||
      !_.get(soi, "soi_name") ||
      !_.get(soi, "base_url")
    ) {
      throw new HTTPError(400, null, {}, "dia_00014000002");
    }

    // TODO: Think about whether we need to support Dynamic Generate **global_id**.
    // Use global_id to find SOI.
    let soiInDB = await findOneByGlobalId(
      COLLECTIONS_NAME.sois,
      soi.global_id,
      {
        projection: {
          global_id: 1
        }
      }
    );
    // global_id must be unique
    if (soiInDB) {
      // global_id already exist
      throw new HTTPError(
        400,
        null,
        {
          global_id: soi.global_id
        },
        "dia_00014000001",
        soi.global_id
      );
    }

    // if securityKey exist, then add securityKey to soi
    if (securityKey) {
      soi[CONFIG.SECURITY_KEY_IN_DB] = securityKey;
    }

    let insertOneWriteOpResultObject = await insertOne(
      COLLECTIONS_NAME.sois,
      soi
    );
    return {
      _id: insertOneWriteOpResultObject.insertedId,
      global_id: soi.global_id
    };
  } catch (err) {
    // Already HTTPError, then throw it
    throw err;
  }
}

/**
 * OperationIndex: 0002
 * Get a SOI by global_id
 * @param {string} gid - global_id
 *
 * @returns {object}
 */
async function getSOI(gid, securityKey) {
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
    let soi = await checkSOIExistByGlobalID(gid, securityKey);
    if (!soi) {
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
    return soi;
  } catch (err) {
    throw err;
  }
}

/**
 * OperationIndex: 0010
 * Get a SOIs
 * @param {string} securityKey - global_id
 *
 * @returns {object}
 */
async function getSOIs(securityKey) {
  try {
    let query = {};
    if (securityKey) {
      query[CONFIG.SECURITY_KEY_IN_DB] = {
        $eq: securityKey
      };
    }

    let sois = await find(COLLECTIONS_NAME.sois, query);
    return sois;
  } catch (err) {
    throw err;
  }
}

async function updateSOI(gid, soi, securityKey) {
  try {
    // Make sure can find SOI, if cannot, the it will throw 404 error
    await checkSOIExistByGlobalID(gid, securityKey);

    // Remove cannot update fields
    delete soi.created_at;
    delete soi._id;
    delete soi.global_id;

    let originalSoi = await getSOI(gid);
    let obj = _.merge({}, originalSoi, soi);
    obj.modified_at = Date.now();
    let result = await updateOne(
      COLLECTIONS_NAME.sois,
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

async function updateSOIStatus(gid, originalSoi) {
  try {
    // if user didn't pass originalSoi, then get it
    if (!originalSoi) {
      originalSoi = await getSOI(gid);
    }
    // let soiStatusCheckTime = config.SOI_STATUS_CHECK_TIME;
    let soi = _.merge({}, DEFAULT_SOI, originalSoi);
    let status = await new Promise((resolve, reject) => {
      let headers = {};
      if (soi.api_key) {
        headers[constants.API_KEY_HEADER] = soi.api_key;
      }
      // send request
      axios({
        baseURL: soi.base_url,
        method: soi.health.method,
        url: soi.health.path,
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
      originalSoi.status = "ACTIVE";
    } else {
      originalSoi.status = "INACTIVE";
    }
    originalSoi.modified_at = Date.now();
    let result = await updateMany(
      COLLECTIONS_NAME.intelligences,
      {
        "soi.global_id": {
          $eq: gid
        }
      },
      {
        $set: {
          "soi.status": originalSoi.status
        }
      }
    );
    result = await updateOne(
      COLLECTIONS_NAME.sois,
      {
        global_id: {
          $eq: gid
        }
      },
      {
        $set: originalSoi
      }
    );
    return {
      status: originalSoi.status
    };
  } catch (err) {
    throw err;
  }
}

async function unregisterSOI(gid, securityKey) {
  try {
    // Make sure can find SOI, if cannot, the it will throw 404 error
    await checkSOIExistByGlobalID(gid, securityKey);

    let query = {
      soi_gid: {
        $eq: gid
      }
    };

    if (securityKey) {
      query[CONFIG.SECURITY_KEY_IN_DB] = {
        $eq: securityKey
      };
    }
    // remove all intelligences that this soi created
    await remove(COLLECTIONS_NAME.intelligences, {
      query
    });

    let soiQuery = {
      global_id: {
        $eq: gid
      }
    };
    if (securityKey) {
      soiQuery[CONFIG.SECURITY_KEY_IN_DB] = {
        $eq: securityKey
      };
    }

    // remove this SOI in sois collection
    let result = await remove(COLLECTIONS_NAME.sois, soiQuery);
    return result;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  registerSOI,
  getSOI,
  updateSOI,
  unregisterSOI,
  updateSOIStatus,
  getSOIs
};
