/**
 * Created by Shaoke Xu on 5/5/18.
 */
const express = require('express');
const logger = require('./util/logger');
const packageJson = require('../package.json');

// routers
const apikey = require('./apis/apikey');

function createAPIRouters(){
  const router = express.Router();

  // middleware that is specific to this router
  router.use(function timeLog (req, res, next) {
    logger.info('[API Router] Time: ', Date.now());
    next();
  });

  // register redfin routers
  apikey.router(router);
  return router;
}

function createHealthRouter(){
  const router = express.Router();

  // middleware that is specific to this router
  router.use(function timeLog (req, res, next) {
    logger.info('[Health Router] Time: ', Date.now());
    next();
  });

  router.get('/', function (req, res) {
    res.send(`Welcome to ${packageJson.name}!`);
  });

  return router;
}

function createRouters(app){
  app.use('/api', createAPIRouters());
  app.use('/', createHealthRouter());
}

module.exports = createRouters;