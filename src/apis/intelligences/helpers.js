const _ = require('lodash');
const {HTTPError} = require('../../util/Error');
const {insertMany} = require('../../util/db');
const {COLLECTIONS_NAME} = require('../../util/constants');

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
            suitable_agents:[
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
            if(!intelligence.global_id){
                err.push({
                    key: 'global_id',
                    description: 'global_id is undefined.'
                });
            }
            if(!intelligence.soi_gid){
                err.push({
                    key: 'soi_gid',
                    description: 'soi_gid is undefined.'
                });
            }
            if(!intelligence.url){
                err.push({
                    key: 'url',
                    description: 'url is undefined.'
                });
            }
            if(err.length){
                validationError.push({
                    intelligence,
                    error: err
                });
            }
            intelligence._id = intelligence.global_id;
            intelligence = _.merge({}, defaultIntelligence, intelligence);
            return intelligence;
        });
        
        if(validationError.length){
            throw new HTTPError(400, err, validationError, 'dia_00064000001');
        }

        let result = await insertMany(COLLECTIONS_NAME.intelligences, intelligences);
        return result.insertedIds;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    addIntelligences,
}