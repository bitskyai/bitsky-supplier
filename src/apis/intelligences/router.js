let _registered = false;
const _ = require('lodash');
const helpers = require('./helpers');
const {HTTPError} = require('../../util/error');
const {
    CONFIG,
  } = require("../../util/constants");

function registerRouter(router) {
    if (!_registered) {
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
                    next(new HTTPError(500, err, {}, 'dia_00055000001'));
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
                    next(new HTTPError(500, err, {}, 'dia_00065000001'));
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
                    next(new HTTPError(500, err, {}, 'dia_00075000001'));
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
                    next(new HTTPError(500, err, {}, 'dia_00075000001'));
                }
            }
        });
    }
}

module.exports = registerRouter;