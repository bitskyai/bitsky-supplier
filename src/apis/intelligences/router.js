let _registered = false;
const _ = require('lodash');
const helpers = require('./helpers');
const {HTTPError} = require('../../util/Error');

function registerRouter(router) {
    if (!_registered) {
        router.post('/intelligences', async (req, res, next) => {
            try{
                let key = await helpers.addIntelligences(_.get(req, 'body'));
                res.send(key);
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
    }
}

module.exports = registerRouter;