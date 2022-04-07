const { CronJob, CronTime } = require('cron');

const socketService = require("../services/socket.io");
const reminderDbService = require("../dbops/reminder.dbops");
const settings = require("../models/settings.json");

const crons = [];
const minutes = +settings.office.start.split(":")[1];

var waterBreakJob = new CronJob(`${minutes} * * * *`, function () {
    console.log('water break');
    socketService.emit("notify", { type: "broadcast", message: "water break" });
}, null, true, 'Asia/Kolkata');
waterBreakJob.start();
crons.push({ time: `{min} * * * *`, job: waterBreakJob });

var workBreakJob1 = new CronJob(`${(minutes + 25) % 60} * * * *`, function () {
    console.log('work break 1');
    socketService.emit("notify", { type: "broadcast", message: "work break" });
}, null, true, 'Asia/Kolkata');
workBreakJob1.start();
crons.push({ time: `{(min + 25) % 60} * * * *`, job: workBreakJob1 });

var workBreakJob2 = new CronJob(`${(minutes + 30 + 25) % 60} * * * *`, function () {
    console.log('work break 2');
    socketService.emit("notify", { type: "broadcast", message: "work break" });
}, null, true, 'Asia/Kolkata');
workBreakJob2.start();
crons.push({ time: `{(min + 30 + 25) % 60} * * * *`, job: workBreakJob2 });

var workResumeJob1 = new CronJob(`${(minutes + 30) % 60} * * * *`, function () {
    console.log('work resume 1');
    socketService.emit("notify", { type: "broadcast", message: "work resume" });
}, null, true, 'Asia/Kolkata');
workResumeJob1.start();
crons.push({ time: `{(min + 30) % 60} * * * *`, job: workResumeJob1 });

var workResumeJob2 = new CronJob(`${(minutes + 30 + 30) % 60} * * * *`, function () {
    console.log('work resume 2');
    socketService.emit("notify", { type: "broadcast", message: "work resume" });
}, null, true, 'Asia/Kolkata');
workResumeJob2.start();
crons.push({ time: `{(min + 30 + 30) % 60} * * * *`, job: workResumeJob2 });


/* REMINDER CRON */
let reminderJob = new CronJob(`* * * * *`, async function () {
    try {
        console.log("reminderCron");
        let reminders = await reminderDbService.getAllRemindersByOptions(
            { time: new Date(+new Date().setSeconds(0, 0) + (2 * 60 * 1000)) }
        );
        console.log("reminders", reminders);
        if (reminders && reminders.length > 0) {
            reminders.forEach(reminder => {
                socketService.emit("notify", { type: "reminder", message: "reminder received", data: reminder }, reminder.username);
            });
        }
    } catch (e) {
        console.log(e);
    }
}, null, true, 'Asia/Kolkata');
reminderJob.start();

/* LUNCH BREAK CRON */
// START
const lunchTimeHourStart = settings.lunch.start.split(":")[0];
const lunchTimeMinStart = settings.lunch.start.split(":")[1];
let lunchBreakStartJob = new CronJob(`${lunchTimeMinStart} ${lunchTimeHourStart} * * *`, async function () {
    try {
        console.log("lunchBreakStartCron");
        socketService.emit("notify", { type: "broadcast", message: "lunch break start" });
    } catch (e) {
        console.log(e);
    }
}, null, true, 'Asia/Kolkata');
lunchBreakStartJob.start();
// END
const lunchTimeHourEnd = settings.lunch.end.split(":")[0];
const lunchTimeMinEnd = settings.lunch.end.split(":")[1];
let lunchBreakEndJob = new CronJob(`${lunchTimeMinEnd} ${lunchTimeHourEnd} * * *`, async function () {
    try {
        console.log("lunchBreakEndCron");
        socketService.emit("notify", { type: "broadcast", message: "lunch break end" });
    } catch (e) {
        console.log(e);
    }
}, null, true, 'Asia/Kolkata');
lunchBreakEndJob.start();

/* SNACKS BREAK CRON */
// START
const snacksTimeHourStart = settings.snacks.start.split(":")[0];
const snacksTimeMinStart = settings.snacks.start.split(":")[1];
let snacksBreakStartJob = new CronJob(`${snacksTimeMinStart} ${snacksTimeHourStart} * * *`, async function () {
    try {
        console.log("snacksBreakStartCron");
        socketService.emit("notify", { type: "broadcast", message: "snacks break start" });
    } catch (e) {
        console.log(e);
    }
}, null, true, 'Asia/Kolkata');
snacksBreakStartJob.start();
// END
const snacksTimeHourEnd = settings.snacks.end.split(":")[0];
const snacksTimeMinEnd = settings.snacks.end.split(":")[1];
let snacksBreakEndJob = new CronJob(`${snacksTimeMinEnd} ${snacksTimeHourEnd} * * *`, async function () {
    try {
        console.log("snacksBreakEndCron");
        socketService.emit("notify", { type: "broadcast", message: "snacks break end" });
    } catch (e) {
        console.log(e);
    }
}, null, true, 'Asia/Kolkata');
snacksBreakEndJob.start();

module.exports = {
    restartCrons: (settings) => {
        try {
            console.log("restart crons");
            let officeMin = +settings.office.start.split(":")[1];
            crons.forEach(obj => {
                const timeFormula = obj.time.match(/(?<={)(.*)(?=})/)[0];
                const newTime = obj.time.replace(`{${timeFormula}}`, eval(timeFormula.replace("min", officeMin)));
                console.log({ timeFormula, newTime });
                obj.job.setTime(new CronTime(newTime));
                obj.job.start();
            });
            let hr = settings.lunch.start.split(":")[0];
            let min = settings.lunch.start.split(":")[1];
            // lunch start
            lunchBreakStartJob.setTime(new CronTime(`${min} ${hr} * * *`));
            lunchBreakStartJob.start();
            // lunch end
            hr = settings.lunch.end.split(":")[0];
            min = settings.lunch.end.split(":")[1];
            lunchBreakEndJob.setTime(new CronTime(`${min} ${hr} * * *`));
            lunchBreakEndJob.start();
            // snacks start
            hr = settings.snacks.start.split(":")[0];
            min = settings.snacks.start.split(":")[1];
            snacksBreakStartJob.setTime(new CronTime(`${min} ${hr} * * *`));
            snacksBreakStartJob.start();
            // snacks end
            hr = settings.snacks.end.split(":")[0];
            min = settings.snacks.end.split(":")[1];
            snacksBreakEndJob.setTime(new CronTime(`${min} ${hr} * * *`));
            snacksBreakEndJob.start();

        } catch (e) {
            console.log(e);
        }
    },
};
