/**
 * Created by Shaoke Xu on 5/5/18.
 */
const express = require('express');
const logger = require('./util/logger');
const packageJson = require('../package.json');

// routers
const apikey = require('./apis/apikey');
const sois = require('./apis/sois');
const intelligences = require('./apis/intelligences');
const agents = require('./apis/agents');
const health = require('./apis/health');
const agenda = require('./apis/agenda');

function createAPIRouters(app){
  const router = express.Router();

  // middleware that is specific to this router
  router.use(function timeLog (req, res, next) {
    logger.info('[API Router] Time: ', Date.now());
    next();
  });

  // register redfin routers
  apikey.router(router);
  sois.router(router);
  intelligences.router(router);
  agents.router(router);
  agenda.router(null, app);

  return router;
}

function createHealthRouter(app){
  const router = express.Router();

  // middleware that is specific to this router
  router.use(function timeLog (req, res, next) {
    logger.info('[Health Router] Time: ', Date.now());
    next();
  });

  router.get('/', function (req, res) {
    res.send(`Welcome to ${packageJson.name}!`);
  });
  health.router(router);
  return router;
}

function createRouters(app){
  app.use('/apis', createAPIRouters(app));
  app.use('/', createHealthRouter(app));
}

module.exports = createRouters;