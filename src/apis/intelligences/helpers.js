const _ = require('lodash');
const {
    HTTPError
} = require('../../util/Error');
const {
    insertMany,
    find,
    updateMany
} = require('../../util/db');
const {
    COLLECTIONS_NAME,
    DEFAULT_SOI
} = require('../../util/constants');
const config = require('../../config');

const soisHelpers = require('../sois/helpers');

async function addIntelligences(intelligences) {
    try {
        let defaultIntelligence = {
            priority: 100000,
            created_at: Date.now(),
            modified_at: Date.now(),
            last_collected_at: 0,
            started_at: 0,
            ended_at: 0,
            status: 'CONFIGURED',
            suitable_agents: [
                'browserExtension'
            ]
        }
        // TODO: data validation need to improve
        let validationError = [];
        intelligences = intelligences.map((intelligence) => {
            // remove data that cannot set by user
            delete intelligence.created_at;
            delete intelligence.modified_at;
            delete intelligence.last_collected_at;
            delete intelligence.started_at;
            delete intelligence.ended_at;
            delete intelligence.status;
            let err = [];
            if (!intelligence.global_id) {
                err.push({
                    key: 'global_id',
                    description: 'global_id is undefined.'
                });
            }
            if (!intelligence.soi_gid) {
                err.push({
                    key: 'soi_gid',
                    description: 'soi_gid is undefined.'
                });
            }
            if (!intelligence.url) {
                err.push({
                    key: 'url',
                    description: 'url is undefined.'
                });
            }
            if (err.length) {
                validationError.push({
                    intelligence,
                    error: err
                });
            }
            intelligence._id = intelligence.global_id;
            intelligence = _.merge({}, defaultIntelligence, intelligence);
            return intelligence;
        });

        if (validationError.length) {
            throw new HTTPError(400, err, validationError, 'dia_00064000001');
        }

        let result = await insertMany(COLLECTIONS_NAME.intelligences, intelligences);
        return result.insertedIds;
    } catch (err) {
        throw err;
    }
}

async function getIntelligences(agentType, agentGid, limit) {
    try {
        // TODO: need to improve intelligences schedule
        // 1. Think about if a lot of intelligences, how to schedule them
        // make them can be more efficient
        // 2. think about the case that SOI is inactive
        let intelligences = await find(COLLECTIONS_NAME.intelligences, {
            status: {
                $nin: ['RUNNING']
            }
        }, {
            sort: ['soi_gid', 'priority'],
            limit: limit || config.EACH_TIME_INTELLIGENCES_NUMBER
        });

        let gids = [];
        let sois = {};
        for(let i=0; i<intelligences.length; i++){
            let item = intelligences[i]||{};
            gids.push(item.global_id);
            if(sois[item.soi.global_id]){
                item.soi = sois[item.soi.global_id];
            }else{
                let soi = await soisHelpers.getSOI(item.soi.global_id);
                sois[item.soi.global_id] = _.merge({}, DEFAULT_SOI, soi);
                item.soi = sois[item.soi.global_id];
            }
        }

        await updateMany(COLLECTIONS_NAME.intelligences, {
            global_id: {
                $in: gids
            }
        }, {
            $set: {
                started_at: Date.now(),
                status: 'RUNNING',
                ended_at: 0,
                agent: {
                    global_id: agentGid,
                    status: 'ACTIVE',
                    type: agentType,
                    started_at: Date.now()
                }
            }
        });

        return intelligences;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    addIntelligences,
    getIntelligences
}