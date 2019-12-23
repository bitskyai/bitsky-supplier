const _ = require("lodash");
const Ajv = require("ajv");
const uuidv4 = require('uuid/v4');

const soiSchema = require("../schemas/soi.json");
const agentSchema = require("../schemas/agent.json");
const intelligenceSchema = require("../schemas/intelligence.json");
const UnknownData = require("../data_models/UnknownData");
const { logUnknownDataToDB } = require("./db");
const logger = require("./logger");
const { AGENT_STATE, SOI_STATE } = require("./constants");
const { CustomError } = require('./error');
/**
 * Get a number value. If it doesn't contain valid number value, then return NaN
 * @param {*} val
 * @returns {number|NaN}
 */
function getNumber(val) {
  // ignore following error
  if (val === "—" || !val) {
    // In some property they don't have Bathrooms information, and it set to -
    return NaN;
  }
  // if it is string, then try to get number value from string
  if (typeof val === "string") {
    let num = val.match(/([+-]?[\s]*[\d]+[\d,\.\s]*)/) || [];
    num = num[0];
    if (!num) {
      logAnUnKnownData(`[getNumber][Cannot Convert String to Number][${val}]`, {
        val
      });
      return NaN;
    } else {
      // remove , and \s
      num = num.replace(/[,\s]/g, "");
      return parseFloat(num);
    }
  } else if (typeof val === "number") {
    return val;
  } else if (typeof val === "boolean") {
    if (val) {
      return 1;
    }
    return 0;
  } else {
    logger.error(`[getNumber] fail. Val: %s`, val);
    return NaN;
  }
}

/**
 *  Encode a string to base64
 *
 * @param {*} str - string want to encode, if it isn't a string, will automatically convert to a string
 * @return {string} - base64 string
 */
function btoa(str) {
  // if it is undefined or null, direct return back
  if (str === undefined || str === null) {
    return str;
  }

  // if it is object, then json stringify
  if (typeof str === "object") {
    str = JSON.stringify(str);
  } else {
    str = str.toString();
  }
  return Buffer.from(str).toString("base64");
}

/**
 *  Decode a base64 to a string
 *
 * @param {*} str - base64 string want to decode
 * @return {string} - string
 */
function atob(str) {
  return Buffer.from(str, "base64").toString("ascii");
}

/**
 * Warning: We will not log same message to DB, for same message, latest one will overwrite old one. So if you want to keep both, make message is different.
 * @param {String} message - Description message for this unknown data
 * @param {Object} [metadata] - Additional Data want log to DB.
 * @param {Error Stack} [errorStack] - Error stack.
 */
async function logAnUnKnownData(message, metadata, errorStack) {
  try {
    let unknownData = new UnknownData();
    unknownData.globalId = btoa(message);
    unknownData.message = message;
    unknownData.metadata = metadata || {};
    if (!errorStack) {
      unknownData.stack = new Error().stack;
    } else {
      unknownData.stack = errorStack;
    }
    return await logUnknownDataToDB(unknownData.serialize());
  } catch (err) {
    // since this isn't effect function, so don't need to block code flow
    console.error(`logAnUnKnownData fail. `, err);
    return false;
  }
}

/**
 * Get UTC timestamp of a specific time in today. Default return "00:01:00"
 * @param {string} [timeString] - Specific time in today you want to get UTC timestamp. Format should looks like "00:10:11"
 * @returns {number} - UTC timestamp
 */
function getTodaySpecificTimeUTCTimestamp(timeString) {
  if (!timeString) {
    timeString = "00:01:00";
  }
  let date = new Date();
  return Date.parse(
    `${date.getFullYear()}-${date.getMonth() +
      1}-${date.getDate()}, ${timeString} UTC`
  );
}

/**
 * Deeply omit keys.
 * @example
  let obj = {
  	stack: 'stack1',
  	message: 'message1',
  	pro1: {
		stack:'stack2',
		message: 'message2',
		pro1: {
			stack:'stack3',
			message: 'message3',
			pro1: {
				stack:'stack4',
				message: 'message4',
				pro2: {
					name: 'name1'
				}
			}
		}
	  },
	  pro2: {
		stack:'stack2',
		message: 'message2',
		pro1: {
			stack:'stack3',
			message: 'message3',
			pro1: {
				stack:'stack4',
				message: 'message4',
			}
		}
  	}
  }

  omit(obj, ['stack', 'name'], ['pro1', 'pro2'])

  result 
  {
	"message": "message1",
	"pro1": {
		"message": "message2",
		"pro1": {
		"message": "message3",
		"pro1": {
			"message": "message4",
			"pro2": {}
			}
		}
	},
	"pro2": {
		"message": "message2",
		"pro1": {
			"message": "message3",
			"pro1": {
				"message": "message4"
			}
		}
	}
  }
 * @param {object} obj - obj need to be omitted, after omit it will return a new object 
 * @param {array} omitKeys - Array of keys that need to be omitted
 * @param {array} iterateKeys - Array of keys for property need to search
 * 
 * @returns{object}
 */
function omit(obj, omitKeys, iterateKeys) {
  if (typeof obj != "object" || !omitKeys || !iterateKeys) {
    return obj;
  }
  obj = _.omit(obj, omitKeys);
  iterateKeys.forEach(key => {
    if (obj[key]) {
      obj[key] = omit(obj[key], omitKeys, iterateKeys);
    }
  });
  return obj;
}

/**
 * Validate Result
 * @typedef {Object} ValidateResult
 * @property {boolean} valid - true: valid, false: invalid
 * @property {array} errors - Ajv validation errors. Read more detail in [Validation Errors](https://github.com/epoberezkin/ajv#validation-errors)
 */

/**
 * Based on Agent Schema to validate an agent
 * @param {object} agentData - agent data want to be validate
 * @returns {ValidateResult}
 */
function validateAgent(agentData) {
  var ajv = new Ajv();
  let valid = ajv.validate(agentSchema, agentData);
  return {
	  valid,
	  errors: ajv.errors
  };
}

/**
 * Based on Intelligence Schema to validate an intelligence
 * @param {object} intelligenceData - intelligence data want to be validated
 * @returns {ValidateResult}
 */
function validateIntelligence(intelligenceData) {
  var ajv = new Ajv();
  let valid = ajv.validate(intelligenceSchema, intelligenceData);
  return {
	  valid,
	  errors: ajv.errors
  };
}

/**
 * Based on SOI Schema to validate a SOI
 * @param {object} soiData - agent data want to be validate
 * @returns {ValidateResult}
 */
function validateSOI(soiData) {
  var ajv = new Ajv();
  let valid = ajv.validate(soiSchema, soiData);
  return {
	  valid,
	  errors: ajv.errors
  };
}

/**
 * Based on Agent Schema to validate agent and update agent state.
 * If agent state is active, then 
 * @param {object} agentData - agent data want to validate
 * @returns {object} - return validate agent with state be updated to correct
 */
function validateAgentAndUpdateState(agentData) {
  // Default to set agent state to draft, since agent state is required.
  // It is useful for new agent that need to be registered
  if (!agentData.system.state) {
    agentData.system.state = AGENT_STATE.draft;
  }
  // for **deleted** status don't need to validate
  // TODO: maybe need to retrun warning, when need then can change
  if( _.toUpper(agentData.system.state) === _.toUpper(AGENT_STATE.deleted)){
    return agentData;
  }
  let validateResult = validateAgent(agentData);
  // for active state, don't change its state
  if(_.toUpper(agentData.system.state) === _.toUpper(AGENT_STATE.active)){
    if (!validateResult.valid) {
      // for active state, but it isn't valid, then this means something wrong, throw error
      throw new CustomError(null, {agentData}, '00004000001', agentData.globalId);
    }
    // if it is valid, then don't need to change state
  }else{
    if (validateResult.valid) {
      agentData.system.state = _.toUpper(AGENT_STATE.configured);
    } else {
      agentData.system.state = _.toUpper(AGENT_STATE.draft);
    }
  }
  return agentData;
}

/**
 * Based on SOI Schema to validate SOI and update SOI state.

 * @param {object} soiData - SOI data want to validate
 * @returns {object} - return validate soi with state be updated to correct
 */
function validateSOIAndUpdateState(soiData) {
  // Default to set SOI state to draft, since SOI state is required.
  // It is useful for new SOI that need to be registered
  if (!soiData.system.state) {
    soiData.system.state = SOI_STATE.draft;
  }
  // for **deleted** status don't need to validate
  // TODO: maybe need to retrun warning, when need then can change
  if( _.toUpper(soiData.system.state) === _.toUpper(soiData.deleted)){
    return soiData;
  }
  let validateResult = validateSOI(soiData);
  console.log("validateSOIAndUpdateState->soiData: ", JSON.stringify(soiData));
  console.log("validateSOIAndUpdateState->validateResult: ", JSON.stringify(validateResult));
  // for active state, don't change its state
  if(_.toUpper(soiData.system.state) === _.toUpper(SOI_STATE.active)){
    if (!validateResult.valid) {
      // for active state, but it isn't valid, then this means something wrong, throw error
      // throw new CustomError(null, {soiData}, '00004000001', soiData.globalId);
      soiData.system.state = _.toUpper(SOI_STATE.draft);
    }
    // if it is valid, then don't need to change state
  }else{
    if (validateResult.valid) {
      soiData.system.state = _.toUpper(SOI_STATE.configured);
    } else {
      soiData.system.state = _.toUpper(SOI_STATE.draft);
    }
  }
  return soiData;
}

function generateGlobalId(entityType){
  let id = uuidv4();
  if(!entityType){
    entityType = "munew-dia";
  }
  id = `${entityType}::${Date.now()}::${id}`;
  id = btoa(id);
  return id;
}

function convertStringToRegExp(inputstring){
  var regParts = inputstring.match(/^\/(.*?)\/([gim]*)$/);
  if (regParts) {
      // the parsed pattern had delimiters and modifiers. handle them. 
      var regex = new RegExp(regParts[1], regParts[2]);
  } else {
      // we got pattern string without delimiters
      var regex = new RegExp(inputstring);
  }
  return regex;
}

module.exports = {
  getNumber,
  btoa,
  atob,
  generateGlobalId,
  logAnUnKnownData,
  getTodaySpecificTimeUTCTimestamp,
  omit,
  validateAgent,
  validateAgentAndUpdateState,
  validateIntelligence,
  validateSOI,
  validateSOIAndUpdateState,
  convertStringToRegExp
};
