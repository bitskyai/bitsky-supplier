const logger = require('../util/logger');

/**
 * TODO: implement your migrate task
 */
async function migrateTask() {
    try {
        logger.info("Add your migrate task logic");
        return true;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    migrateTask
};