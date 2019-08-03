const jobNames = require('../jobNames');
const {
    COLLECTIONS_NAME
} = require('../../../util/constants');
const {
    updateMany
} = require('../../../util/db');
const config = require('../../../config');
const logger = require('../../../util/logger');

module.exports = function (agenda) {
    agenda.define(jobNames.timeoutIntelligence, async (job, done) => {
        try{
            let timeoutValue = Date.now() - config.TIMEOUT_VALUE_FOR_INTELLIGENCE;
            let runningStatus = "RUNNING";
            let configuredStatus = "TIMEOUT";
            await updateMany(COLLECTIONS_NAME.intelligences, {
                "system.startedAt": {
                    $lt: timeoutValue
                },
                "system.state": {
                    $eq: runningStatus
                }
            }, {
                $set: {
                    "system.state": configuredStatus,
                    "system.endedAt": Date.now(),
                    "system.modified": Date.now()
                }
            })

            done();
        }catch(err){
            logger.error(err);
        }
    });
};