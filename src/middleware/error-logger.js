const _ = require('lodash');
const logger = require('../util/logger');

function createErrorLogger(_opts) {
  return function errorHandler(err, req, res, next) {
    if(err.statusCode<500){
      logger.warn(err.message, err.serialize());
    }else{
      logger.error(err.message, err.serialize());
    }
    next(err);
  };
}

module.exports = createErrorLogger;
