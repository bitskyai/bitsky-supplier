const {
    COLLECTIONS_NAME
} = require('../../util/constants');
const {
    HTTPError
} = require('../../util/Error');
const {
    findOneByGlobalId,
    insertOne
} = require('../../util/db');

const logger = require('../../util/logger');

/**
 * OperationIndex: 0001
 * Register a SOI to DIA.
 * Follow KISS principle, you need to make sure your **global_id** is unique. 
 * Currently, **global_id** is only way for **SOI** Identity. 
 * @param {object} soi - SOI need to be register
 * 
 * @returns {object}
 */
async function registerSOI(soi) {
    try {
        // logger.debug('>>>>>>>>>>>>>>>>');
        // TODO: Think about whether we need to support Dynamic Generate **global_id**.
        // Use global_id to find SOI.
        let soiInDB = await findOneByGlobalId(COLLECTIONS_NAME.sois, soi.global_id, {
            projection: {
                global_id: 1
            }
        });
        // global_id must be unique
        if (soiInDB) {
            // global_id already exist
            throw new HTTPError(400, null, {
                global_id: soi.global_id
            }, 'dia_00014000001', soi.global_id);
        }

        let insertOneWriteOpResultObject = await insertOne(COLLECTIONS_NAME.sois, soi);
        return {
            _id: insertOneWriteOpResultObject.insertedId,
            global_id: soi.global_id
        };
    } catch (err) {
        // logger.debug('===============', err);
        // Already HTTPError, then throw it
        if (err instanceof HTTPError) {
            // logger.debug("Don't need to create a HTTPError");
            throw err;
        } else {
            // logger.debug("Need to create a HTTPError");
            // Otherwise create a HTTPError
            throw new HTTPError(500, err, {
                global_id: soi.global_id
            }, 'dia_00015000001');
        }
    }
}

/**
 * OperationIndex: 0002
 * Get a SOI by global_id
 * @param {string} gid - global_id
 * 
 * @returns {object}
 */
async function getSOI(gid) {
    try {
        if (!gid) {
            throw new HTTPError(400, null, {
                global_id: gid
            }, 'dia_00024000001');
        }
        let soi = await findOneByGlobalId(COLLECTIONS_NAME.sois, gid);
        if (!soi) {
            throw new HTTPError(404, null, {
                global_id: gid
            }, 'dia_00024040001', gid);
        }
        return soi;
    } catch (err) {
        // Already HTTPError, then throw it
        if (err instanceof HTTPError) {
            throw err;
        } else {
            // Otherwise create a HTTPError
            throw new HTTPError(500, err, {}, 'dia_00025000001');
        }
    }
}

async function updateSOI(soi) {
    try {

    } catch (err) {

    }
}

async function unregisterSOI() {

}

module.exports = {
    registerSOI,
    getSOI,
    updateSOI,
    unregisterSOI
}