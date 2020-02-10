const packageJson = require('../../../package.json');

async function healthStatus() {
    return {
        name: packageJson.name,
        description: packageJson.description,
        version: packageJson.version
    }
}

module.exports = {
    healthStatus,
}