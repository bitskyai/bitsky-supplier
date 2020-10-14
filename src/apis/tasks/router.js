let _registered = false;
const _ = require('lodash');
const helpers = require('./helpers');
const {HTTPError} = require('../../util/error');
const {
    CONFIG,
  } = require("../../util/constants");

function registerRouter(router) {
    if (!_registered) {
        router.get('/manangement/tasks', async (req, res, next) => {
            try{
                let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
                // default return 50 items
                let tasks = await helpers.getTasksForManagement(_.get(req, 'query.cursor'),  _.get(req, 'query.url'), _.get(req, 'query.state'), _.get(req, 'query.limit', 50), securityKey);
                res.send(tasks);
            }catch(err){
                // Already HTTPError, then throw it
                if (err instanceof HTTPError) {
                    next(err);
                } else {
                    // Otherwise create a HTTPError
                    next(new HTTPError(500, err, {}, '00055000001'));
                }
            }
        });

        router.post('/manangement/tasks/pause', async (req, res, next) => {
            try{
                let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
                await helpers.pauseTasksForManagement(_.get(req, 'query.url'), _.get(req, 'query.state'), _.get(req, 'body'), securityKey);
                res.status(204).send();
            }catch(err){
                // Already HTTPError, then throw it
                if (err instanceof HTTPError) {
                    next(err);
                } else {
                    // Otherwise create a HTTPError
                    next(new HTTPError(500, err, {}, '00055000001'));
                }
            }
        });

        router.post('/manangement/tasks/resume', async (req, res, next) => {
            try{
                let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
                await helpers.resumeTasksForManagement(_.get(req, 'query.url'), _.get(req, 'query.state'), _.get(req, 'body'), securityKey);
                res.status(204).send();
            }catch(err){
                // Already HTTPError, then throw it
                if (err instanceof HTTPError) {
                    next(err);
                } else {
                    // Otherwise create a HTTPError
                    next(new HTTPError(500, err, {}, '00055000001'));
                }
            }
        });

        router.delete('/manangement/tasks', async (req, res, next) => {
            try{
                let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
                await helpers.deleteTasksForManagement(_.get(req, 'query.url'), _.get(req, 'query.state'), _.get(req, 'body'), securityKey);
                res.status(204).send();
            }catch(err){
                // Already HTTPError, then throw it
                if (err instanceof HTTPError) {
                    next(err);
                } else {
                    // Otherwise create a HTTPError
                    next(new HTTPError(500, err, {}, '00055000001'));
                }
            }
        });

        router.get('/tasks', async (req, res, next) => {
            try{
                let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
                let tasks = await helpers.getTasks(_.get(req, 'query.gid'), securityKey);
                res.send(tasks);
            }catch(err){
                // Already HTTPError, then throw it
                if (err instanceof HTTPError) {
                    next(err);
                } else {
                    // Otherwise create a HTTPError
                    next(new HTTPError(500, err, {}, '00055000001'));
                }
            }
        });

        router.post('/tasks', async (req, res, next) => {
            try{
                let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
                let result = await helpers.addTasks(_.get(req, 'body'), securityKey);
                res.send(result);
            }catch(err){
                // Already HTTPError, then throw it
                if (err instanceof HTTPError) {
                    next(err);
                } else {
                    // Otherwise create a HTTPError
                    next(new HTTPError(500, err, {}, '00065000001'));
                }
            }
        });

        router.put('/tasks', async (req, res, next) => {
            try{
                let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
                await helpers.updateTasks(_.get(req, 'body'), securityKey);
                res.status(204).send();
            }catch(err){
                // Already HTTPError, then throw it
                if (err instanceof HTTPError) {
                    next(err);
                } else {
                    // Otherwise create a HTTPError
                    next(new HTTPError(500, err, {}, '00075000001'));
                }
            }
        });
    }
}

module.exports = registerRouter;
