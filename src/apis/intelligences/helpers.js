const uuidv4 = require('uuid/v4');

async function generateAPIKey() {
    return uuidv4();
}

module.exports = {
    generateAPIKey,
}