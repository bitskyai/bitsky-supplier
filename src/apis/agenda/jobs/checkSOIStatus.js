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
    agenda.define(jobNames.checkSOIStatus, async (job, done) => {
        try{
            // Get All SOIs
            
        }catch(err){
            logger.error(err);
        }
    });
};