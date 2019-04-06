const http = require('http');
const _ = require('lodash');
const uitls = require('../util/utils');
const config = require('../config');

// This reponder is assuming that all <500 errors are safe to be responded
// with their .message attribute.
// DO NOT write sensitive data into error messages.
function createErrorResponder(_opts) {
  // 4 params needed for Express to know it's a error handler middleware
  // eslint-disable-next-line
  return function errorResponder(err, req, res, next) {
    
    let statusCode = err.statusCode ? err.statusCode : 500;
    res.status(statusCode);
    // if it is production env, then don't return stack information
    if(config.NODE_ENV.toLowerCase() === 'production'){
      res.send(uitls.omit(err.serialize(), ['stack'], ['causedBy']));
    }else{
      res.send(err.serialize());
    }
  };
}

module.exports = createErrorResponder;
