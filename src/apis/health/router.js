let _registered = false;
const _ = require('lodash');
const helpers = require('./helpers');

function registerRouter(router) {
    if (!_registered) {
        router.get('/health', async (req, res, next) => {
            let status = await helpers.healthStatus();
            res.send(status);
        });
    }
}

module.exports = registerRouter;