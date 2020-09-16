const _ = require("lodash");
const { http } = require("../../util/http");
const {
  CONFIG,
  DEFAULT_RETAILER,
  RETAILER_STATE
} = require("../../util/constants");
const { HTTPError } = require("../../util/error");
const {
  validateRetailer,
  validateRetailerAndUpdateState,
  generateGlobalId
} = require("../../util/utils");
import {
  addRetailerDB,
  getRetailersDB,
  getRetailerByGlobalIdDB,
  updateRetailerDB,
  deleteRetailerDB
} from "../../dbController/Retailer.ctrl";
import {
  updateTasksRetailerStateForManagementDB,
  deleteTasksByRetailerForManagementDB
} from '../../dbController/TaskAndHistory.ctrl'
const logger = require("../../util/logger");

async function checkRetailerExistByGlobalID(gid, securityKey) {
  try {
    let retailer = await getRetailerByGlobalIdDB(gid, securityKey);

    // retailer doesn't exist
    if (!retailer) {
      throw new HTTPError(
        404,
        null,
        { globalId: gid },
        "00004040001",
        gid,
        securityKey
      );
    }
    return retailer;
  } catch (err) {
    throw err;
  }
}

/**
 * OperationIndex: 0001
 * Register a Retailer to BitSky.
 * Follow KISS principle, you need to make sure your **globalId** is unique.
 * Currently, **globalId** is only way for **Retailer** Identity.
 * @param {object} retailer - Retailer need to be register
 * @param {string} securityKey - The securityKey that previous service send, used to identify who send this request
 *
 * @returns {object}
 */
async function registerRetailer(
  retailer,
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
    retailer = _.merge({}, DEFAULT_RETAILER, retailer);
    // Update system information
    retailer.system.created = Date.now();
    retailer.system.modified = Date.now();
    // if securityKey exist, then add securityKey to retailer
    if (securityKey) {
      retailer.system[CONFIG.SECURITY_KEY_IN_DB] = securityKey;
    }
    if (!retailer.globalId) {
      retailer.globalId = generateGlobalId("retailer");
    }

    // validate retailer
    let validateResult = validateRetailer(retailer);
    if (!validateResult.valid) {
      // Don't allow user to Create/Update an invalid Retailer, this will reduce the complex of maintain tasks
      throw new HTTPError(422, validateResult.errors, { retailer }, "00014000002");
    }

    let insertOneWriteOpResultObject = await addRetailerDB(retailer);

    // After update Retailer, need to update Retailer state
    await updateRetailerState(retailer.globalId, retailer);
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
 * Get a Retailer by globalId
 * @param {string} gid - globalId
 *
 * @returns {object}
 */
export async function getRetailer(gid, securityKey) {
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
    let retailer = await getRetailerByGlobalIdDB(gid, securityKey);
    if (!retailer) {
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
    return retailer;
  } catch (err) {
    throw err;
  }
}

/**
 * OperationIndex: 0010
 * Get a Retailers
 * @param {string} securityKey - globalId
 *
 * @returns {object}
 */
async function getRetailers(securityKey) {
  try {
    let retailers = await getRetailersDB(securityKey);
    return retailers;
  } catch (err) {
    throw err;
  }
}

async function updateRetailer(gid, retailer, securityKey) {
  try {
    // Make sure can find Retailer, if cannot, the it will throw 404 error
    let originalRetailer = await checkRetailerExistByGlobalID(gid, securityKey);

    // Remove cannot update fields
    delete retailer._id;
    delete retailer.id;
    delete retailer.globalId;
    if (retailer.system) {
      delete retailer.system;
    }

    // let originalRetailer = await getRetailer(gid, securityKey);
    let obj = _.merge({}, originalRetailer, retailer);
    obj.system.modified = Date.now();
    obj = validateRetailerAndUpdateState(obj);
    let result = await updateRetailerDB(gid, securityKey, obj);

    // After update Retailer, need to update Retailer state
    await updateRetailerState(gid, originalRetailer);
    return result;
  } catch (err) {
    throw err;
  }
}

/**
 * Check Retailer Health
 * @param {string} baseURL - Base URL of Retailer server
 * @param {string} method - HTTP method
 * @param {string} url - health path
 *
 * @returns {object} - {status: true/false, reason: err}
 */
async function checkRetailerHealth(baseURL, method, url) {
  try {
    // Ping Retailer server
    await http({
      baseURL: baseURL,
      method: method,
      url: url
    });
    return {
      status: true
    };
  } catch (err) {
    logger.warn("[checkRetailerHealth] Ping Retailer fail", { err: err });
    return {
      status: false,
      reason: err
    };
  }
}

/**
 * Update Retailer state
 * @param {string} gid - Retailer globalId
 * @param {object} originalRetailer - Original Retailer Data
 */
async function updateRetailerState(gid, originalRetailer, dontUpdateModified?: boolean) {
  try {
    // if user didn't pass originalRetailer, then get it
    if (!originalRetailer) {
      originalRetailer = await getRetailer(gid, null);
    }

    // check whether need to check Retailer State. To avoid performance issue, don't allow user check Retailer state too frequently
    // TODO: maybe we need to think about support **FORCE** update
    // 2019/12/21: comment to avoid sometimes ping Retailer server return same state
    // let lastPing = originalRetailer.system.lastPing;
    // if (Date.now() - lastPing < CONFIG.RETAILER_STATE_CHECK_TIME) {
    //   // Don't need to check Retailer state
    //   return {
    //     state: originalRetailer.system.state
    //   };
    // }

    // validate retailer, Retailer must be a valid Retailer
    let validateResult = validateRetailer(originalRetailer);
    if (!validateResult.valid) {
      // Don't allow user to Create/Update an invalid Retailer, this will reduce the complex of maintain tasks
      throw new HTTPError(422, validateResult.errors, { originalRetailer }, "00014000002");
    }

    // default set to fail
    let state = _.toUpper(RETAILER_STATE.failed);
    let pingFailReason = undefined;
    let retailerHealth = await checkRetailerHealth(
      originalRetailer.baseURL,
      originalRetailer.health.method,
      originalRetailer.health.path
    );
    if (retailerHealth.status) {
      // Retailer is health
      state = _.toUpper(RETAILER_STATE.active);
    } else {
      state = _.toUpper(RETAILER_STATE.failed);
      if (typeof retailerHealth.reason === "object") {
        pingFailReason = JSON.stringify(retailerHealth.reason);
      } else {
        pingFailReason = retailerHealth.reason;
      }
    }

    await updateTasksRetailerStateForManagementDB(gid, state, dontUpdateModified);
    const retailerSystemInfo:any = {
      system: {
        state: state,
        lastPing: Date.now(),
        pingFailReason: pingFailReason
      }
    }
    if(!dontUpdateModified){
      retailerSystemInfo.system.modified = Date.now();
    }
    await updateRetailerDB(gid, null, retailerSystemInfo);
    return {
      state: state,
      reason: pingFailReason
    };
  } catch (err) {
    throw err;
  }
}

async function unregisterRetailer(gid, securityKey) {
  try {
    // Make sure can find Retailer, if cannot, the it will throw 404 error
    await checkRetailerExistByGlobalID(gid, securityKey);

    await deleteTasksByRetailerForManagementDB(gid, securityKey);
    // remove this Retailer in retailers collection
    let result = await deleteRetailerDB(gid, securityKey);
    return result;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  registerRetailer,
  getRetailer,
  updateRetailer,
  unregisterRetailer,
  updateRetailerState,
  getRetailers
};
