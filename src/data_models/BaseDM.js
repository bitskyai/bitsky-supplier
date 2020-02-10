// const uuidv4 = require('uuid/v4');
const _ = require('lodash');
class BaseDM{
    constructor(){
        this._data={
            globalId: undefined,    // default generate a uuid
            modified_at: Date.now(),
            data:{}                 // store you data information to data object
        };
    }

    get globalId(){
        return this._data.globalId;
    }

    set globalId(val){
        this._data.globalId = val;
    }

    set data(val){
        throw new Error(`The readonly property cannot be written. ${val} was passed`);
    }

    get data(){
        return this._data.data;
    }

    serialize(){
        let data = _.cloneDeep(this._data);
        return data;
    }
    deserialize(data){
        this._data = data;
        return this;
    }
}

module.exports = BaseDM;
