let _registered = false;
const _ = require('lodash');
const helpers = require('./helpers');

function registerRouter(router) {
    if (!_registered) {
        router.post('/sois', async (req, res, next) => {
            try {
                let result = await helpers.registerSOI(_.get(req, 'body'));
                res.send(result);
            } catch (err) {
                next(err);
            }
        });

        router.delete('/sois/{gid}', async (req, res, next) => {
            let result = await helpers.unregisterSOI();
            res.send(result);
        });
    }
}

module.exports = registerRouter;