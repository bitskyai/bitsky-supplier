const _ = require('lodash');
const BaseDM = require('./BaseDM');

class ServerInformation extends BaseDM{
    constructor(){
        super();
        this._data = Object.assign(this._data, {
            data: {
                name: undefined,
                version: undefined,
                description: undefined,
                migration_version: undefined
            }
        });
    }

    set name(val){
        this._data.data.name = val;
    }

    get name(){
        return this._data.data.name;
    }

    set version(val){
        this._data.data.version = val;
    }

    get version(){
        return this._data.data.version;
    }

    get description(){
        return this._data.data.description;
    }

    set description(val){
        this._data.data.description = val;
    }

    set migrationVersion(val){
        this._data.data.migration_version = val;
    }

    get migrationVersion(){
        return this._data.data.migration_version;
    }
}

module.exports = ServerInformation;