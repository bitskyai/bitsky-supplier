const _ = require('lodash');
const BaseDM = require('./BaseDM');

class UnknownData extends BaseDM{
    constructor(){
        super();
        var stack = new Error().stack;
        this._data = Object.assign(this._data, {
            stack: stack,
            created_at: Date.now(),
            message: undefined,
            metadata: {}
        });
    }

    get stack(){
        return this._data.stack;
    }

    set stack(stackVal){
        this._data.stack = stackVal;
    }

    set message(val){
        if(typeof val === 'object'){
            val = JSON.stringify(val);
        }
        this._data.message = val;
    }

    get message(){
        return this._data.message;
    }

    set metadata(val){
        if(typeof val !== 'object'){
            throw new Error(`metadata must be an object, but you passed ${val}`);
        }
        this._data.metadata = val;
    }

    get metadata(){
        return this._data.metadata;
    }
}

module.exports = UnknownData;