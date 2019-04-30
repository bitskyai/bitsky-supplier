const timeoutJob = require('./jobs/timeout');
const checkSOIStatus = require('./jobs/checkSOIStatus');

async function registerJobs(agenda) {
    timeoutJob(agenda);
    checkSOIStatus(agenda);
}

module.exports = {
    registerJobs,
}