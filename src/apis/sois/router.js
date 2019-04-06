let _registered = false;
const _ = require('lodash');
const helpers = require('./helpers');
const {HTTPError} = require('../../util/Error');

function registerRouter(router) {
    if (!_registered) {
        router.post('/sois', async (req, res, next) => {
            try {
                let result = await helpers.registerSOI(_.get(req, 'body'));
                res.send(result);
            } catch (err) {
                // Already HTTPError, then throw it
                if (err instanceof HTTPError) {
                    next(err);
                } else {
                    // Otherwise create a HTTPError
                    next(new HTTPError(500, err, {}, 'dia_00015000001'));
                }
            }
        });

        router.get('/sois/:gid', async (req, res, next) => {
            try {
                let result = await helpers.getSOI(_.get(req, 'params.gid'));
                res.send(result);
            } catch (err) {
                // Already HTTPError, then throw it
                if (err instanceof HTTPError) {
                    next(err);
                } else {
                    // Otherwise create a HTTPError
                    next(new HTTPError(500, err, {}, 'dia_00025000001'));
                }
            }
        });

        router.delete('/sois/:gid', async (req, res, next) => {
            try{
                let result = await helpers.unregisterSOI(_.get(req, 'params.gid'));
                res.send(result);
            }catch(err){
                // Already HTTPError, then throw its
                if (err instanceof HTTPError) {
                    next(err);
                } else {
                    // Otherwise create a HTTPError
                    next(new HTTPError(500, err, {}, 'dia_00035000001'));
                }
            }
        });
    }
}

module.exports = registerRouter;