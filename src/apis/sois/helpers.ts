const _ = require("lodash");
const { http } = require("../../util/http");
const {
  CONFIG,
  DEFAULT_SOI,
  SOI_STATE
} = require("../../util/constants");
const { HTTPError } = require("../../util/error");
const {
  validateSOI,
  validateSOIAndUpdateState,
  generateGlobalId
} = require("../../util/utils");
import {
  addSOIDB,
  getSOIsDB,
  getSOIByGlobalIdDB,
  updateSOIDB,
  deleteSOIDB
} from "../../dbController/SOI.ctrl";
import {
  updateIntelligencesSOIStateForManagementDB,
  deleteIntelligencesBySOIForManagementDB
} from '../../dbController/IntelligenceAndHistory.ctrl'
const logger = require("../../util/logger");

async function checkSOIExistByGlobalID(gid, securityKey) {
  try {
    let soi = await getSOIByGlobalIdDB(gid, securityKey);

    // soi doesn't exist
    if (!soi) {
      throw new HTTPError(
        404,
        null,
        { globalId: gid },
        "00004040001",
        gid,
        securityKey
      );
    }
    return soi;
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
async function registerSOI(
  soi,
  securityKey
): Promise<
  | {
      _id: string;
      globalId: string;
    }
  | Error
> {
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
      // Don't allow user to Create/Update an invalid SOI, this will reduce the complex of maintain intelligences
      throw new HTTPError(422, validateResult.errors, { soi }, "00014000002");
    }

    let insertOneWriteOpResultObject = await addSOIDB(soi);

    // After update SOI, need to update SOI state
    await updateSOIState(soi.globalId, soi);
    return {
      _id: insertOneWriteOpResultObject._id,
      globalId: insertOneWriteOpResultObject.globalId
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
export async function getSOI(gid, securityKey) {
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
    let soi = await getSOIByGlobalIdDB(gid, securityKey);
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
    let sois = await getSOIsDB(securityKey);
    return sois;
  } catch (err) {
    throw err;
  }
}

async function updateSOI(gid, soi, securityKey) {
  try {
    // Make sure can find SOI, if cannot, the it will throw 404 error
    let originalSoi = await checkSOIExistByGlobalID(gid, securityKey);

    // Remove cannot update fields
    delete soi._id;
    delete soi.id;
    delete soi.globalId;
    if (soi.system) {
      delete soi.system;
    }

    // let originalSoi = await getSOI(gid, securityKey);
    let obj = _.merge({}, originalSoi, soi);
    obj.system.modified = Date.now();
    obj = validateSOIAndUpdateState(obj);
    let result = await updateSOIDB(gid, securityKey, obj);

    // After update SOI, need to update SOI state
    await updateSOIState(gid, originalSoi);
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
async function checkSOIHealth(baseURL, method, url) {
  try {
    // Ping SOI server
    await http({
      baseURL: baseURL,
      method: method,
      url: url
    });
    return {
      status: true
    };
  } catch (err) {
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
      originalSoi = await getSOI(gid, null);
    }

    // check whether need to check SOI State. To avoid performance issue, don't allow user check SOI state too frequently
    // TODO: maybe we need to think about support **FORCE** update
    // 2019/12/21: comment to avoid sometimes ping SOI server return same state
    // let lastPing = originalSoi.system.lastPing;
    // if (Date.now() - lastPing < CONFIG.SOI_STATE_CHECK_TIME) {
    //   // Don't need to check SOI state
    //   return {
    //     state: originalSoi.system.state
    //   };
    // }

    // validate soi, SOI must be a valid SOI
    let validateResult = validateSOI(originalSoi);
    if (!validateResult.valid) {
      // Don't allow user to Create/Update an invalid SOI, this will reduce the complex of maintain intelligences
      throw new HTTPError(422, validateResult.errors, { originalSoi }, "00014000002");
    }

    // default set to fail
    let state = _.toUpper(SOI_STATE.failed);
    let pingFailReason = undefined;
    let soiHealth = await checkSOIHealth(
      originalSoi.baseURL,
      originalSoi.health.method,
      originalSoi.health.path
    );
    if (soiHealth.status) {
      // SOI is health
      state = _.toUpper(SOI_STATE.active);
    } else {
      state = _.toUpper(SOI_STATE.failed);
      if (typeof soiHealth.reason === "object") {
        pingFailReason = JSON.stringify(soiHealth.reason);
      } else {
        pingFailReason = soiHealth.reason;
      }
    }

    await updateIntelligencesSOIStateForManagementDB(gid, state);
    await updateSOIDB(gid, null, {
      system: {
        state: state,
        modified: Date.now(),
        lastPing: Date.now(),
        pingFailReason: pingFailReason
      }
    });
    return {
      state: state,
      reason: pingFailReason
    };
  } catch (err) {
    throw err;
  }
}

async function unregisterSOI(gid, securityKey) {
  try {
    // Make sure can find SOI, if cannot, the it will throw 404 error
    await checkSOIExistByGlobalID(gid, securityKey);

    await deleteIntelligencesBySOIForManagementDB(gid, securityKey);
    // remove this SOI in sois collection
    let result = await deleteSOIDB(gid, securityKey);
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
