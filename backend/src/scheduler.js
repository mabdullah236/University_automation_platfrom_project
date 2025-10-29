
const cron = require('node-cron');
const { checkAndActivatePortals } = require('./services/automationService');

const startScheduler = () => {
    // Schedule the task to run every day at 2:00 AM
    cron.schedule('0 2 * * *', () => {
        console.log('Triggering scheduled job: checkAndActivatePortals');
        checkAndActivatePortals();
    }, {
        scheduled: true,
        timezone: "America/New_York" // Example timezone, configure as needed
    });

    console.log('Scheduler started. Portal activation check will run daily at 2:00 AM.');
};

module.exports = startScheduler;
