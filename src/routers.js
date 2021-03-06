/**
 * Created by Neo on 5/5/18.
 */
const express = require('express');
const logger = require('./util/logger');
const packageJson = require('../package.json');

// routers
const apikey = require('./apis/apikey');
const self = require('./apis/self');
const retailers = require('./apis/retailers');
const tasks = require('./apis/tasks');
const tasksHistory = require('./apis/taskshistory');
const producers = require('./apis/producers');
const health = require('./apis/health');

function createAPIRouters(app){
  const router = express.Router();

  // middleware that is specific to this router
  router.use(function timeLog (req, res, next) {
    next();
  });

  // register redfin routers
  apikey.router(router);
  self.router(router);
  retailers.router(router);
  tasks.router(router);
  tasksHistory.router(router);
  producers.router(router);


  return router;
}

function createHealthRouter(app){
  const router = express.Router();

  // middleware that is specific to this router
  router.use(function timeLog (req, res, next) {
    logger.debug(`[Health Router] Time: ${ Date.now()}`);
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