const MongoClient = require('mongodb').MongoClient;
const _ = require('lodash');
const config = require('../config');
const logger = require('./logger');

// private variables, to store reference, shouldn't be directed access
let _mongoDBURL;
let _db;

if (config.MONGODB_URI) {
    // TODO validate **MONGODB_URI**
    _mongoDBURL = config.MONGODB_URI;
} else if (config.MONGODB_URL && config.MONGODB_NAME) {
    if (!config.MONGODB_USERNAME || !config.MONGODB_PASSWORD) {
        _mongoDBURL = `mongodb://${config.MONGODB_URL}/${config.MONGODB_NAME}`;
    } else {
        _mongoDBURL = `mongodb://${config.MONGODB_USERNAME}:${config.MONGODB_PASSWORD}@${config.MONGODB_URL}/${config.MONGODB_NAME}`;
    }
} else {
    throw Error(`You MUST set env **MONGODB_URI**, Format: mongodb://<dbUser>:<dbPassword>@<dbHost>:<dbPort>/<dbName>. 
                    Or set env **MONGODB_USERNAME**, **MONGODB_PASSWORD**, **MONGODB_URL**, **MONGODB_NAME** `);
}

// TODO: need to think about support multiple database
async function DB() {
    try {
        if (_db) {
            return _db;
        }
        return new Promise((resolve, reject) => {
            logger.info(`mongodbURL: ${_mongoDBURL}`);
            let options = {
                autoReconnect: true,
                reconnectTries: Number.MAX_SAFE_INTEGER,
                reconnectInterval: 500,
                useNewUrlParser: true
            };
            logger.info(`options: `, {
                options
            });
            MongoClient.connect(_mongoDBURL, options, (err, client) => {
                if (err) {
                    logger.error('Connect to DB Fail!', err);
                    reject(err);
                } else {
                    _db = client.db();
                    logger.info('Connect to DB successful!');
                    resolve(_db);
                }
            });
        });
    } catch (err) {
        logger.error('[db->DB], error: ', err);
        throw err;
    }
}

async function find(collectionName, query, options) {
    try {
        let db = await DB();
        const collection = db.collection(collectionName);
        let result = await collection.find(query, options || {});
        result = result.toArray();
        return result;
    } catch (err) {
        logger.error('[db->find], error: ', err);
        throw err;
    }
}

async function findOne(collectionName, query, options) {
    try {
        let db = await DB();
        const collection = db.collection(collectionName);
        const result = await collection.findOne(query, options || {});
        return result;
    } catch (err) {
        logger.error('[db->findOne], error: ', err);
        throw err;
    }
}

async function updateOne(collectionName, filter, update, options) {
    try {
        let db = await DB();
        const collection = db.collection(collectionName);
        const result = await collection.updateOne(filter, update, options || {});
        return result;
    } catch (err) {
        logger.error('[db->updateOne], error: ', err);
        throw err;
    }
}

async function updateMany(collectionName, filter, update, options) {
    try {
        let db = await DB();
        const collection = db.collection(collectionName);
        const result = await collection.updateMany(filter, update, options || {});
        return result;
    } catch (err) {
        logger.error('[db->updateMany], error: ', err);
        throw err;
    }
}

async function insertOne(collectionName, doc) {
    try {
        let db = await DB();
        let collection = db.collection(collectionName);
        if (!doc.create_at) {
            doc.create_at = Date.now();
        }
        let result = await collection.insertOne(doc);
        return result;
    } catch (err) {
        logger.error('[db->insertOne], error: ', err);
        throw err;
    }
}

async function findOneById(collectionName, id, options) {
    try {
        let db = await DB();
        const collection = db.collection(collectionName);
        const result = await collection.findOne({
            _id: {
                $eq: id
            }
        }, options || {});
        return result;
    } catch (err) {
        logger.error('[db->findOneById], error: ', err);
        throw err;
    }
}

async function findOneByGlobalId(collectionName, id, options) {
    try {
        let db = await DB();
        const collection = db.collection(collectionName);
        const result = await collection.findOne({
            global_id: {
                $eq: id
            }
        }, options || {});
        return result;
    } catch (err) {
        logger.error('[db->findOneByGlobalId], error: ', err);
        throw err;
    }
}

async function checkExistByID(collectionName, id) {
    const result = await findOneById(collectionName, id, {
        '_id': 1
    });
    return !!result;
}

async function updateOneById(collectionName, id, data, upsert) {
    try {
        let db = await DB();
        const collection = db.collection(collectionName);
        if (!data.modified_at) {
            data.modified_at = Date.now();
        }

        let result = await collection.updateOne({
            _id: {
                $eq: id
            }
        }, {
            $set: data
        }, {
            upsert: upsert
        });
        return result;
    } catch (err) {
        logger.error('[db->updateOneById], error: ', err);
        throw err;
    }
}

async function updateOneByGlobalId(collectionName, gid, data, upsert) {
    try {
        let db = await DB();
        const collection = db.collection(collectionName);
        if (!data.modified_at) {
            data.modified_at = Date.now();
        }

        let result = await collection.updateOne({
            global_id: {
                $eq: gid
            }
        }, {
            $set: data
        }, {
            upsert: upsert
        });
        return result;
    } catch (err) {
        logger.error('[db->updateOneByGlobalId], error: ', err);
        throw err;
    }
}

async function logUnknownDataToDB(doc) {
    try {
        if (!doc.global_id) {
            logger.error(`no global_id, ignore it. `, doc);
            return false;
        }
        let result = await updateOneByGlobalId(doc.global_id, doc, COLLECTIONS_NAME.unknownData, true);
        return result;
    } catch (err) {
        logger.error('[db->logUnknownDataToDB], error: ', err);
        throw err;
    }
}

module.exports = {
    DB,
    find,
    findOne,
    insertOne,
    updateOne,
    updateMany,
    findOneById,
    updateOneById,
    updateOneByGlobalId,
    logUnknownDataToDB
}