let _registered = false;
const _ = require('lodash');
const helpers = require('./helpers');
const {HTTPError} = require('../../util/error');
const {
    CONFIG,
  } = require("../../util/constants");

function registerRouter(router) {
    if (!_registered) {
        router.get('/manangement/intelligences', async (req, res, next) => {
            try{
                let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
                // default return 50 items
                let intelligences = await helpers.getIntelligencesForManagement(_.get(req, 'query.cursor'),  _.get(req, 'query.url'), _.get(req, 'query.state'), _.get(req, 'query.limit', 50), securityKey);
                res.send(intelligences);
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

        router.post('/manangement/intelligences/pause', async (req, res, next) => {
            try{
                let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
                await helpers.pauseIntelligencesForManagement(_.get(req, 'query.url'), _.get(req, 'body'), securityKey);
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

        router.post('/manangement/intelligences/resume', async (req, res, next) => {
            try{
                let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
                await helpers.resumeIntelligencesForManagement(_.get(req, 'query.url'), _.get(req, 'body'), securityKey);
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

        router.delete('/manangement/intelligences', async (req, res, next) => {
            try{
                let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
                await helpers.deleteIntelligencesForManagement(_.get(req, 'query.url'), _.get(req, 'body'), securityKey);
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

        router.get('/intelligences', async (req, res, next) => {
            try{
                let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
                let intelligences = await helpers.getIntelligences(_.get(req, 'query.gid'), securityKey);
                res.send(intelligences);
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

        router.post('/intelligences', async (req, res, next) => {
            try{
                let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
                let result = await helpers.addIntelligences(_.get(req, 'body'), securityKey);
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

        router.put('/intelligences', async (req, res, next) => {
            try{
                let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
                await helpers.updateIntelligences(_.get(req, 'body'), securityKey);
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

        router.delete('/intelligences', async (req, res, next) => {
            try{
                let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
                await helpers.deleteIntelligences(_.get(req, 'query.gids'), securityKey);
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
