let _registered = false;
const _ = require('lodash');
const helpers = require('./helpers');

function registerRouter(router) {
    if (!_registered) {
        router.get('/apikey', async (req, res, next) => {
            let key = await helpers.generateAPIKey();
            res.send(key);
        });
    }
}

module.exports = registerRouter;