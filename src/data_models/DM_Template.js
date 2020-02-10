const _ = require('lodash');
const BaseDM = require('./BaseDM');

class YourClassName extends BaseDM{
    constructor(){
        super();
        this._data = {
            name: undefined
        };
    }

    set name(val){
        this._data.name = val;
    }

    get name(){
        return this._data.name;
    }

    serialize(){
        return this._data;
    }

    deserialize(data){
        this._data = data;
    }

    static get READ_ONLY(){
        return {};
    }

    static set READ_ONLY(val){
        throw new Error(`The readonly property cannot be written. ${value} was passed`);
    }
}

module.exports = YourClassName;