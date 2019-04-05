const packageJson = require('../../package.json');

const CONFIG = {
    LOG_FILES_PATH: './public/log',
    NODE_ENV: 'development',
    SERVICE_NAME: packageJson.name,
    LOG_LEVEL: 'debug',
    PORT: 9099,     // server port number
    MONGODB_URI: `mongodb://localhost:27017/${packageJson.name}`
};

const COLLECTIONS_NAME = {
    'serverInfo': 'server_info',
    'history': 'history',
    'log': 'log',
    'error': 'error',
    'unknownData': 'unknown_data'
};

module.exports = {
    CONFIG,
    COLLECTIONS_NAME
}