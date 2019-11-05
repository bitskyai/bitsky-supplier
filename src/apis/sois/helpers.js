const _ = require("lodash");
const { http } = require("../../util/http");
const {
  CONFIG,
  DEFAULT_SOI,
  COLLECTIONS_NAME,
  SOI_STATE
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
const {
  validateSOI,
  validateSOIAndUpdateState,
  generateGlobalId
} = require("../../util/utils");
// const config = require("../../config");
const logger = require("../../util/logger");

async function checkSOIExistByGlobalID(gid, securityKey) {
  try {
    let soiQuery = {
      globalId: {
        $eq: gid
      }
    };
    if (securityKey) {
      soiQuery[`system.${CONFIG.SECURITY_KEY_IN_DB}`] = {
        $eq: securityKey
      };
    }

    let soi = await find(COLLECTIONS_NAME.sois, soiQuery);

    // soi doesn't exist
    if (!soi || !soi.length) {
      throw new HTTPError(
        404,
        null,
        { globalId: gid },
        "00004040001",
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
 * Follow KISS principle, you need to make sure your **globalId** is unique.
 * Currently, **globalId** is only way for **SOI** Identity.
 * @param {object} soi - SOI need to be register
 * @param {string} securityKey - The securityKey that previous service send, used to identify who send this request
 *
 * @returns {object}
 */
async function registerSOI(soi, securityKey) {
  try {
    // Set default value
    soi = _.merge({}, DEFAULT_SOI, soi);
    // Update system information
    soi.system.created = Date.now();
    soi.system.modified = Date.now();
    // if securityKey exist, then add securityKey to soi
    if (securityKey) {
      soi.system[CONFIG.SECURITY_KEY_IN_DB] = securityKey;
    }
    if (!soi.globalId) {
      soi.globalId = generateGlobalId("soi");
    }

    // validate soi
    let validateResult = validateSOI(soi);
    if (!validateResult.valid) {
      throw new HTTPError(
        422,
        validateResult.errors,
        { soi },
        "00014000002"
      );
    }

    // Use globalId to find SOI.
    let soiInDB = await findOneByGlobalId(COLLECTIONS_NAME.sois, soi.globalId, {
      projection: {
        globalId: 1
      }
    });
    // globalId must be unique
    if (soiInDB) {
      // globalId already exist
      throw new HTTPError(
        400,
        null,
        {
          globalId: soi.globalId
        },
        "00014000001",
        soi.globalId
      );
    }

    let insertOneWriteOpResultObject = await insertOne(
      COLLECTIONS_NAME.sois,
      soi
    );
    // After update SOI, need to update SOI state
    await updateSOIState(soi.globalId, soi);
    return {
      _id: insertOneWriteOpResultObject.insertedId,
      globalId: soi.globalId
    };
  } catch (err) {
    // Already HTTPError, then throw it
    throw err;
  }
}

/**
 * OperationIndex: 0002
 * Get a SOI by globalId
 * @param {string} gid - globalId
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
          globalId: gid
        },
        "00024000001"
      );
    }
    let soi = await checkSOIExistByGlobalID(gid, securityKey);
    if (!soi) {
      throw new HTTPError(
        404,
        null,
        {
          globalId: gid
        },
        "00024040001",
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
 * @param {string} securityKey - globalId
 *
 * @returns {object}
 */
async function getSOIs(securityKey) {
  try {
    let query = {};
    if (securityKey) {
      query[`system.${CONFIG.SECURITY_KEY_IN_DB}`] = {
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
    if (soi.system) {
      delete soi.system;
    }

    let originalSoi = await getSOI(gid);
    let obj = _.merge({}, originalSoi, soi);
    obj.system.modified = Date.now();
    obj = validateSOIAndUpdateState(obj);
    let result = await updateOne(
      COLLECTIONS_NAME.sois,
      {
        globalId: {
          $eq: gid
        }
      },
      {
        $set: obj
      }
    );

    // After update SOI, need to update SOI state
    updateSOIState(gid, originalSoi);
    return result;
  } catch (err) {
    throw err;
  }
}

/**
 * Check SOI Health
 * @param {string} baseURL - Base URL of SOI server
 * @param {string} method - HTTP method
 * @param {string} url - health path
 * 
 * @returns {object} - {status: true/false, reason: err}
 */
async function checkSOIHealth(baseURL, method, url){
  try{
    // Ping SOI server
    await http({
      baseURL: baseURL,
      method: method,
      url: url
    });
    return {
      status: true
    };
  }catch(err){
    logger.warn("[checkSOIHealth] Ping SOI fail", { err: err });
    return {
      status: false,
      reason: err
    };
  }
}

/**
 * Update SOI state
 * @param {string} gid - SOI globalId
 * @param {object} originalSoi - Original SOI Data
 */
async function updateSOIState(gid, originalSoi) {
  try {
    // if user didn't pass originalSoi, then get it
    if (!originalSoi) {
      originalSoi = await getSOI(gid);
    }

    // check whether need to check SOI State. To avoid performance issue, don't allow user check SOI state too frequently
    // TODO: maybe we need to think about support **FORCE** update
    let lastPing = originalSoi.system.lastPing;
    if(Date.now() - lastPing < CONFIG.SOI_STATE_CHECK_TIME){
      // Don't need to check SOI state
      return {
        state: originalSoi.system.state
      }
    }

    // First validate SOI, in case it was draft
    originalSoi = validateSOIAndUpdateState(originalSoi);

    let state = originalSoi.system.state;
    let pingFailReason = '';
    if(_.toUpper(state) !== _.toUpper(SOI_STATE.draft)){
      // if it isn't draft, then ping SOI
      let result = await checkSOIHealth(originalSoi.baseURL, originalSoi.health.method, originalSoi.health.path);
      if (result.status) {
        // SOI is health
        state = _.toUpper(SOI_STATE.active);
        pingFailReason = '';
      } else {
        state = _.toUpper(SOI_STATE.failed);
        if(typeof result.reason === 'object'){
          pingFailReason = JSON.stringify(result.reason);
        }else{
          pingFailReason = result.reason;
        }
      }
    }
    
    // Update all intelligences that reference to this SOI
    let result = await updateMany(
      COLLECTIONS_NAME.intelligences,
      {
        "soi.globalId": {
          $eq: gid
        }
      },
      {
        $set: {
          "soi.state": state
        }
      }
    );

    // Update this SOI
    result = await updateOne(
      COLLECTIONS_NAME.sois,
      {
        globalId: {
          $eq: gid
        }
      },
      {
        $set: {
          "system.state": state,
          "system.modified": Date.now(),
          "system.lastPing": Date.now(),
          "system.pingFailReason": pingFailReason
        }
      }
    );
    return {
      state: state
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
      "soi.globalId": {
        $eq: gid
      }
    };

    if (securityKey) {
      query[`system.${CONFIG.SECURITY_KEY_IN_DB}`] = {
        $eq: securityKey
      };
    }
    // remove all intelligences that this soi created
    await remove(COLLECTIONS_NAME.intelligences, {
      query
    });

    let soiQuery = {
      globalId: {
        $eq: gid
      }
    };
    if (securityKey) {
      query[`system.${CONFIG.SECURITY_KEY_IN_DB}`] = {
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
  updateSOIState,
  getSOIs
};
