const MongoClient = require('mongodb').MongoClient;
const _ = require('lodash');
const config = require('../config');
const logger = require('./logger');
const {
    HTTPError
} = require('./error');

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

function mongodbConnectionURL() {
    let dbUrl;
    if (config.MONGODB_URI) {
        // TODO validate **MONGODB_URI**
        dbUrl = config.MONGODB_URI;
    } else if (config.MONGODB_URL && config.MONGODB_NAME) {
        if (!config.MONGODB_USERNAME || !config.MONGODB_PASSWORD) {
            dbUrl = `mongodb://${config.MONGODB_URL}/${config.MONGODB_NAME}`;
        } else {
            dbUrl = `mongodb://${config.MONGODB_USERNAME}:${config.MONGODB_PASSWORD}@${config.MONGODB_URL}/${config.MONGODB_NAME}`;
        }
    } else {
        throw Error(`You MUST set env **MONGODB_URI**, Format: mongodb://<dbUser>:<dbPassword>@<dbHost>:<dbPort>/<dbName>. 
                        Or set env **MONGODB_USERNAME**, **MONGODB_PASSWORD**, **MONGODB_URL**, **MONGODB_NAME** `);
    }
    return dbUrl;
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
        throw err;
    }
}

async function findOneByGlobalId(collectionName, gid, options) {
    try {
        let db = await DB();
        const collection = db.collection(collectionName);
        const result = await collection.findOne({
            globalId: {
                $eq: gid
            }
        }, options || {});
        return result;
    } catch (err) {
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
        throw err;
    }
}

async function remove(collectionName, filter, options) {
    try {
        let db = await DB();
        const collection = db.collection(collectionName);
        const result = await collection.remove(filter, options || {});
        return result;
    } catch (err) {
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
        throw err;
    }
}

async function bulkUpdate(collectionName, docs, upsert, dbURL) {
    try {
        const db = await DB(dbURL);
        const collection = db.collection(collectionName);
        let bulkUpdates = [];
        for (let i = 0; i < docs.length; i++) {
            let doc = docs[i];
            let filter;
            if (doc._id) {
                filter = {
                    _id: {
                        $eq: doc._id
                    }
                }
            }else{
                filter = {
                    globalId: {
                        $eq: doc.globalId
                    }
                }
            }
            bulkUpdates.push({
                updateOne: {
                    filter: filter,
                    update: doc,
                    upsert: upsert
                }
            });
        }
        const result = collection.bulkWrite(bulkUpdates);
        return result;
    } catch (err) {
        throw err;
    }
}

async function insertOne(collectionName, doc, options) {
    try {
        let db = await DB();
        let collection = db.collection(collectionName);
        let result = await collection.insertOne(doc, options || {});
        return result;
    } catch (err) {
        throw err;
    }
}

async function insertMany(collectionName, docs, options) {
    try {
        let db = await DB();
        let collection = db.collection(collectionName);
        docs.forEach((doc) => {
            if (!doc.created_at) {
                doc.created_at = Date.now();
            }
        });
        let result = await collection.insertMany(docs, options || {});
        return result;
    } catch (err) {
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
        throw err;
    }
}

async function checkExistByID(collectionName, id) {
    try {
        const result = await findOneById(collectionName, id, {
            '_id': 1
        });
        return !!result;
    } catch (err) {
        throw err;
    }
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
            globalId: {
                $eq: gid
            }
        }, {
            $set: data
        }, {
            upsert: upsert
        });
        return result;
    } catch (err) {
        throw err;
    }
}

async function logUnknownDataToDB(doc) {
    try {
        if (!doc.globalId) {
            logger.error(`no globalId, ignore it. `, doc);
            return false;
        }
        let result = await updateOneByGlobalId(doc.globalId, doc, COLLECTIONS_NAME.unknownData, true);
        return result;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    mongodbConnectionURL,
    DB,
    find,
    findOne,
    findOneByGlobalId,
    insertOne,
    insertMany,
    updateOne,
    updateMany,
    bulkUpdate,
    remove,
    findOneById,
    updateOneById,
    updateOneByGlobalId,
    logUnknownDataToDB
}