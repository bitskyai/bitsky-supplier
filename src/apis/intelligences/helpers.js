const _ = require('lodash');
const {
    HTTPError
} = require('../../util/error');
const {
    remove,
    insertMany,
    find,
    updateMany
} = require('../../util/db');
const {
    COLLECTIONS_NAME,
    DEFAULT_SOI,
    INTELLIGENCE_STATUS
} = require('../../util/constants');
const config = require('../../config');
const soisHelpers = require('../sois/helpers');
const logger = require('../../util/logger');

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
        // hash table for soi globalId
        let soiGlobalIds = {};
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
            if (!intelligence.soi.global_id) {
                err.push({
                    key: 'soi.global_id',
                    description: 'soi.global_id is undefined.'
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
            soiGlobalIds[intelligence.soi.global_id] = 1;
            return intelligence;
        });

        if (validationError.length) {
            throw new HTTPError(400, validationError, validationError, 'dia_00064000001');
        }

        // make sure soi existed
        for(let soiGlobalId in soiGlobalIds){
            await soisHelpers.getSOI(soiGlobalId);
        }
        logger.debug("SOIs exist!", {soiGlobalIds});
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
        limit = Number(limit);
        if(isNaN(limit)){
            limit = config.EACH_TIME_INTELLIGENCES_NUMBER;
        }

        let intelligences = await find(COLLECTIONS_NAME.intelligences, {
            status: {
                $nin: [INTELLIGENCE_STATUS.running, INTELLIGENCE_STATUS.finished]
            }
        }, {
            sort: ['soi.global_id', 'priority'],
            limit: limit
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
            if(!item.agent){
                item.agent = {
                    global_id: agentGid,
                    status: 'ACTIVE',
                    type: agentType,
                    started_at: Date.now()
                };
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

async function updateIntelligences(content){
    try{
        let contentMap = {};
        let gids = content.map((item)=>{
            contentMap[item.global_id] = item;
            return item.global_id;
        });
        // get intelligences by gids
        let intelligences = await find(COLLECTIONS_NAME.intelligences, {
            global_id: {
                $in: gids
            }
        });

        if(!intelligences||!intelligences.length){
            logger.warn("No intelligences found.", {intelligences:content});
            return {};
        }
        
        // update modified_at, ended_at, last_collected_at and status
        intelligences = intelligences.map((item)=>{
            delete item._id;
            item.modified_at = Date.now();
            item.ended_at = Date.now();
            item.last_collected_at = Date.now();
            item.status = _.get(contentMap[item.global_id], 'status', INTELLIGENCE_STATUS.finished);
            return item;
        });

        // add it to intelligences_history
        await insertMany(COLLECTIONS_NAME.intelligencesHistory, intelligences);

        let result = await remove(COLLECTIONS_NAME.intelligences,{
            global_id:{
                $in: gids
            }
        });
        return result;
    }catch(err){
        throw err;
    }
}

async function deleteIntelligences(gids){
    // implement logic
}

module.exports = {
    addIntelligences,
    getIntelligences,
    updateIntelligences,
    deleteIntelligences
}