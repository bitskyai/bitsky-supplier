// const uuidv4 = require('uuid/v4');
const _ = require('lodash');
class BaseDM{
    constructor(){
        this._data={
            global_id: undefined,    // default generate a uuid
            modified_at: Date.now(),
            data:{}                 // store you data information to data object
        };
    }

    get globalId(){
        return this._data.global_id;
    }

    set globalId(val){
        this._data.global_id = val;
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
