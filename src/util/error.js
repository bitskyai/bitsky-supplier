const util = require('util');
const translate = require('./translate');

class CustomError extends Error {
    constructor(error, data, code, ...args){
        let msgTemplate = translate.getTranslateMessage(code);
        let msg;
        if (typeof msgTemplate === "string") {
            args = [msgTemplate].concat(args);
            msg = util.format.apply(null, args);
        }else{
            msg = '';
        }
        super(msg);

        // this means multiple errors cause this error
        if(error instanceof Array){
            error = error.map((item)=>{
                if(item instanceof Error){
                    item = item.serialize();
                    if(item&&item.response){
                        item = item.response.data
                    }
                }
                return item;
            });
        }else if(error instanceof Error){
            error = error.serialize();
            if(error&&error.response){
                error = error.response.data
            }
        }

        this.causedBy = error||'';
        // Error Message
        this.message = msg;
        // Error Code
        this.code = code;
        // Additional Data for this error
        this.data = data;
    }
}

/**
 * @class
 */
class HTTPError extends CustomError {
    /**
     * @constructor HTTPError
     * @param {number} statusCode - HTTP Status Code. https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
     * @param {*} data - Additional Data for this error
     * @param {string} code - Error Code, and will use this error code to get message
     * @param  {...any} args  - Parameters for Error Message
     * 
     * @returns {HTTPError}
     */
    constructor(statusCode, error, data, code, ...args) {
        super(error, data, code, ...args);
        // HTTP Status - https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
        this.statusCode = statusCode || 500;
    }
}

module.exports = {
    CustomError,
    HTTPError
}