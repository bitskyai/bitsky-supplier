const _ = require('lodash');

async function verifyAPIKey(req, res){
    let APIKey = req.get('X-API-KEY');
    let sysAPIKey = process.env.API_KEY;
    let method = req.method || 'post';
    method = method.toLowerCase();
    // for GET request, don't do security check
    if(method!=='get'&&APIKey !== sysAPIKey){
        res.status(403).send('<p>Please make sure you pass correct <b>X-API-KEY</b></p>').end();
        return false;
    }
    return true;
}

module.exports = {
    verifyAPIKey
}