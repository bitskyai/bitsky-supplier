let _registered = false;
const _ = require('lodash');
const Agenda = require('agenda');
const Agendash = require('agendash');
const helpers = require('./helpers');
const {mongodbConnectionURL} = require('../../util/db');
const jobNames = require('./jobNames');
const config = require('../../config');

function registerRouter(router, app) {
    if (!_registered) {
        // router.get('/apikey', async (req, res, next) => {
        //     let key = await helpers.generateAPIKey();
        //     res.send(key);
        // });
        let dbUrl = mongodbConnectionURL();
        console.log(`dbUrl: `, dbUrl);
        const agenda = new Agenda({db: {address: dbUrl}});
        // Agenda UI
        app.use('/agenda', Agendash(agenda));

        // register jobs, so it can used in UI
        helpers.registerJobs(agenda);
        agenda.on("ready", async function () {
            let time = config.TIMEOUT_VALUE_FOR_INTELLIGENCE/(60*1000);
            let soiStatusCheckTime = config.SOI_STATUS_CHECK_TIME/(60*1000);
            await agenda.start();
            await agenda.every(`${time} minutes`, jobNames.timeoutIntelligence);
            await agenda.every(`${soiStatusCheckTime} minutes`, jobNames.checkSOIStatus);
        });
    }
}

module.exports = registerRouter;