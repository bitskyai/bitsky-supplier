
/**
 * @param {number} statusCode - HTTP Status Code
 * @param {string} message - Error message
 * @param {Object} options - Additional Options
 * @param {string} options.code - Error code
 * 
 * @returns {Error}
 */
function createError(statusCode, message, options){
    if(!options){
        options = {}
    }
    let error = new Error(message);
    error.status = statusCode;
    error.metadata = options;
    return error;
}

module.exports = {
    createError
}