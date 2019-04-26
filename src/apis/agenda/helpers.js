const timeoutJob = require('./jobs/timeout');

async function registerJobs(agenda) {
    timeoutJob(agenda);
}

module.exports = {
    registerJobs,
}