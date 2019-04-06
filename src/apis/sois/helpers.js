const _ = require('lodash');
const {
    COLLECTIONS_NAME
} = require('../../util/constants');
const {
    HTTPError
} = require('../../util/Error');
const {
    findOneByGlobalId,
    insertOne,
    updateOne
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

        // validate soi
        // TODO: change to validate based on schema
        if (!_.get(soi, 'global_id') || !_.get(soi, 'soi_name') || !_.get(soi, 'base_url')) {
            throw new HTTPError(400, null, {}, 'dia_00014000002');
        }

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
        // Already HTTPError, then throw it
        throw err;
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
        throw err;
    }
}

async function updateSOI(gid, soi) {
    try {
        // Remove cannot update fields
        delete soi.created_at;
        delete soi._id;
        delete soi.global_id;
        
        let originalSoi = await getSOI(gid);
        let obj = _.merge({}, originalSoi, soi);
        obj.modified_at = Date.now();
        let result = await updateOne(COLLECTIONS_NAME.sois, {
            global_id: {
                $eq: gid
            }
        },{
            $set: obj
        });
        return result;
    } catch (err) {
        throw err;
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