const enLocales = require('../locales/en.json');

function getTranslateMessage(key, locale){
    // TODO: support locale
    let item = enLocales[key];
    if(!item){
        return key;
    }else{
        return item.message;
    }
}

module.exports = {
    getTranslateMessage
}