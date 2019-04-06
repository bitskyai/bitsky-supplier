const packageJson = require('../../package.json');

const CONFIG = {
    LOG_FILES_PATH: './public/log',
    NODE_ENV: 'development',
    SERVICE_NAME: packageJson.name,
    LOG_LEVEL: 'debug',
    PORT: 9099,     // server port number
    MONGODB_URI: `mongodb://localhost:27017/${packageJson.name}`,
    DEFAULT_HEALTH_METHOD: 'GET',
    DEFAULT_HEALTH_PATH: '/health',
    DEFAULT_INTELLIGENCES_METHOD: 'POST',
    DEFAULT_INTELLIGENCES_PATH: '/apis/intelligences'
};

const COLLECTIONS_NAME = {
    'sois': 'sois',
    'intelligences': 'intelligences',
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