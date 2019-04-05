const _ = require('lodash');
const UnknownData = require('../data_models/UnknownData');
const {logUnknownDataToDB} = require('./db');
const logger = require('./logger');

/**
 * Get a number value. If it doesn't contain valid number value, then return NaN
 * @param {*} val 
 * @returns {number|NaN}
 */
function getNumber(val) {
	// ignore following error
	if(val === '—'||!val){
		// In some property they don't have Bathrooms information, and it set to -
		return NaN;
	}
	// if it is string, then try to get number value from string
	if (typeof val === 'string') {
		let num = val.match(/([+-]?[\s]*[\d]+[\d,\.\s]*)/) || [];
		num = num[0];
		if (!num) {
			logAnUnKnownData(`[getNumber][Cannot Convert String to Number][${val}]`, {val});
			return NaN;
		} else {
			// remove , and \s
			num = num.replace(/[,\s]/g, '');
			return parseFloat(num);
		}
	}else if(typeof val === 'number'){
		return val;
	}else if(typeof val === 'boolean'){
		if(val){
			return 1;
		}
		return 0;
	}else{
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
	if (typeof str === 'object') {
		str = JSON.stringify(str);
	} else {
		str = str.toString();
	}
	return Buffer.from(str).toString('base64')
}

/**
 *  Decode a base64 to a string
 *
 * @param {*} str - base64 string want to decode
 * @return {string} - string
 */
function atob(str) {
	return Buffer.from(str, 'base64').toString('ascii');
}

/**
 * Warning: We will not log same message to DB, for same message, latest one will overwrite old one. So if you want to keep both, make message is different.
 * @param {String} message - Description message for this unknown data
 * @param {Object} [metadata] - Additional Data want log to DB. 
 * @param {Error Stack} [errorStack] - Error stack.  
 */
async function logAnUnKnownData(message, metadata, errorStack){
	try{
		let unknownData = new UnknownData();
		unknownData.globalId = btoa(message);
		unknownData.message = message;
		unknownData.metadata = metadata || {};
		if(!errorStack){
			unknownData.stack = new Error().stack;
		}else{
			unknownData.stack = errorStack;
		}
		return await logUnknownDataToDB(unknownData.serialize());
	}catch(err){
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
function getTodaySpecificTimeUTCTimestamp(timeString){
	if(!timeString){
		timeString = '00:01:00';
	}
	let date = new Date();
	return Date.parse(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}, ${timeString} UTC`);
}

module.exports = {
	getNumber,
	btoa,
	atob,
	logAnUnKnownData,
	getTodaySpecificTimeUTCTimestamp
}