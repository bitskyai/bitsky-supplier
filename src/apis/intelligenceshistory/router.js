let _registered = false;
const _ = require('lodash');
const helpers = require('./helpers');
const {HTTPError} = require('../../util/error');
const {
    CONFIG,
  } = require("../../util/constants");

function registerRouter(router) {
    if (!_registered) {
        router.get('/manangement/intelligenceshistory', async (req, res, next) => {
            try{
                let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
                // default return 50 items
                let intelligences = await helpers.getIntelligencesHistoryForManagement(_.get(req, 'query.cursor'),  _.get(req, 'query.url'), _.get(req, 'query.state'), _.get(req, 'query.limit', 50), securityKey);
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

        router.delete('/manangement/intelligenceshistory', async (req, res, next) => {
            try{
                let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
                await helpers.deleteIntelligencesHistoryForManagement(_.get(req, 'query.url'), _.get(req, 'query.state'), _.get(req, 'body'), securityKey);
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

        router.post('/manangement/intelligenceshistory/rerun', async (req, res, next) => {
            try{
                let securityKey = req.get(CONFIG.X_SECURITY_KEY_HEADER);
                await helpers.rerunIntelligencesForManagement(_.get(req, 'query.url'), _.get(req, 'query.state'), _.get(req, 'body'), securityKey);
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
    }
}

module.exports = registerRouter;
