const { CronJob, CronTime } = require('cron');

const socketService = require("../services/socket.io");
const reminderDbService = require("../dbops/reminder.dbops");
// const settings = require("../models/settings.json");

const crons = [];

// const remindBeforeTime = 2 * 60 * 1000; // 2 mins

const {
    officeHourStart, officeMinStart, officeHourEnd, officeMinEnd,
    lunchTimeHourStart, lunchTimeMinStart, lunchTimeHourEnd, lunchTimeMinEnd,
    snacksTimeHourStart, snacksTimeMinStart, snacksTimeHourEnd, snacksTimeMinEnd
} = getCurrentSettings();

/* OFFICE START */
let officeStartJob = new CronJob(`${officeMinStart} ${officeHourStart} * * *`, async function () {
    try {
        console.log("officeStartCron");
        socketService.emit("notify", { type: "broadcast", message: "office start" });
    } catch (e) {
        console.log(e);
    }
}, null, true, 'Asia/Kolkata');
officeStartJob.start();

/* OFFICE END */
let officeEndJob = new CronJob(`${officeMinEnd} ${officeHourEnd} * * *`, async function () {
    try {
        console.log("officeEndCron");
        socketService.emit("notify", { type: "broadcast", message: "office end" });
    } catch (e) {
        console.log(e);
    }
}, null, true, 'Asia/Kolkata');
officeEndJob.start();

/* WATER BREAK */
var waterBreakJob = new CronJob(`${officeMinStart} * * * *`, function () {
    console.log("water break conditions:", isOfficeTime(), !isLunchTime(), !isSnacksTime())
    if (!isLunchTime() && !isSnacksTime()) {
        console.log('water break');
        socketService.emit("notify", { type: "broadcast", message: "water break" });
    }
}, null, true, 'Asia/Kolkata');
waterBreakJob.start();
crons.push({ time: `{min} * * * *`, job: waterBreakJob });

/* WORK BREAK */
var workBreakJob1 = new CronJob(`${(officeMinStart + 25) % 60} * * * *`, function () {
    console.log("work break 1 conditions:", isOfficeTime(), !isLunchTime(), !isSnacksTime())
    if (isOfficeTime() && !isLunchTime() && !isSnacksTime()) {
        console.log('work break 1');
        socketService.emit("notify", { type: "broadcast", message: "work break" });
    }
}, null, true, 'Asia/Kolkata');
workBreakJob1.start();
crons.push({ time: `{(min + 25) % 60} * * * *`, job: workBreakJob1 });

var workBreakJob2 = new CronJob(`${(officeMinStart + 30 + 25) % 60} * * * *`, function () {
    console.log("work break 2 conditions:", isOfficeTime(), !isLunchTime(), !isSnacksTime())
    if (isOfficeTime() && !isLunchTime() && !isSnacksTime()) {
        console.log('work break 2');
        socketService.emit("notify", { type: "broadcast", message: "work break" });
    }
}, null, true, 'Asia/Kolkata');
workBreakJob2.start();
crons.push({ time: `{(min + 30 + 25) % 60} * * * *`, job: workBreakJob2 });

/* WORK RESUME */
var workResumeJob1 = new CronJob(`${(officeMinStart + 30) % 60} * * * *`, function () {
    console.log("work resume 1 conditions:", isOfficeTime(), !isLunchTime(), !isSnacksTime())
    if (isOfficeTime() && !isLunchTime() && !isSnacksTime()) {
        console.log('work resume 1');
        socketService.emit("notify", { type: "broadcast", message: "work resume" });
    }
}, null, true, 'Asia/Kolkata');
workResumeJob1.start();
crons.push({ time: `{(min + 30) % 60} * * * *`, job: workResumeJob1 });

var workResumeJob2 = new CronJob(`${(officeMinStart + 30 + 30) % 60} * * * *`, function () {
    console.log("work resume 2 conditions:", isOfficeTime(), !isLunchTime(), !isSnacksTime())
    if (isOfficeTime() && !isLunchTime() && !isSnacksTime()) {
        console.log('work resume 2');
        socketService.emit("notify", { type: "broadcast", message: "work resume" });
    }
}, null, true, 'Asia/Kolkata');
workResumeJob2.start();
crons.push({ time: `{(min + 30 + 30) % 60} * * * *`, job: workResumeJob2 });

/* REMINDER CRON */
let reminderJob = new CronJob(`* * * * *`, async function () {
    try {
        console.log("reminderCron");
        let reminders = await reminderDbService.getAllRemindersByOptions(
            { time: +new Date().setSeconds(0, 0) }
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
let snacksBreakEndJob = new CronJob(`${snacksTimeMinEnd} ${snacksTimeHourEnd} * * *`, async function () {
    try {
        console.log("snacksBreakEndCron");
        socketService.emit("notify", { type: "broadcast", message: "snacks break end" });
    } catch (e) {
        console.log(e);
    }
}, null, true, 'Asia/Kolkata');
snacksBreakEndJob.start();

function isLunchTime() {
    const { lunchTimeHourStart, lunchTimeMinStart, lunchTimeHourEnd, lunchTimeMinEnd } = getCurrentSettings();
    const lunchTimeStart = new Date().setHours(lunchTimeHourStart, lunchTimeMinStart, 0, 0);
    const lunchTimeEnd = new Date().setHours(lunchTimeHourEnd, lunchTimeMinEnd, 0, 0);
    const timeNow = +new Date();
    return timeNow >= lunchTimeStart && timeNow < lunchTimeEnd;
}

function isSnacksTime() {
    const { snacksTimeHourStart, snacksTimeMinStart, snacksTimeHourEnd, snacksTimeMinEnd } = getCurrentSettings();
    const snacksTimeStart = new Date().setHours(snacksTimeHourStart, snacksTimeMinStart, 0, 0);
    const snacksTimeEnd = new Date().setHours(snacksTimeHourEnd, snacksTimeMinEnd, 0, 0);
    const timeNow = +new Date();
    console.log("isSnacksTime before return", timeNow, snacksTimeStart, snacksTimeEnd);
    return timeNow >= snacksTimeStart && timeNow < snacksTimeEnd;
}

function isOfficeTime() {
    const { officeHourStart, officeMinStart, officeHourEnd, officeMinEnd } = getCurrentSettings();
    const officeTimeStart = new Date().setHours(officeHourStart, officeMinStart, 0, 0);
    const officeTimeEnd = new Date().setHours(officeHourEnd, officeMinEnd, 0, 0);
    const timeNow = +new Date();
    console.log("isOfficeTime before return", timeNow, officeTimeStart, officeTimeEnd);
    return timeNow > officeTimeStart && timeNow < officeTimeEnd;
}

function getCurrentSettings() {
    const settings = require("../models/settings.json");
    // console.log("settings", settings);
    return {
        officeHourStart: +settings.office.start.split(":")[0],
        officeMinStart: +settings.office.start.split(":")[1],
        officeHourEnd: +settings.office.end.split(":")[0],
        officeMinEnd: +settings.office.end.split(":")[1],
        lunchTimeHourStart: +settings.lunch.start.split(":")[0],
        lunchTimeMinStart: +settings.lunch.start.split(":")[1],
        lunchTimeHourEnd: +settings.lunch.end.split(":")[0],
        lunchTimeMinEnd: +settings.lunch.end.split(":")[1],
        snacksTimeHourStart: +settings.snacks.start.split(":")[0],
        snacksTimeMinStart: +settings.snacks.start.split(":")[1],
        snacksTimeHourEnd: +settings.snacks.end.split(":")[0],
        snacksTimeMinEnd: +settings.snacks.end.split(":")[1]
    };
}

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
            let hr = +settings.lunch.start.split(":")[0];
            let min = +settings.lunch.start.split(":")[1];
            // lunch start
            lunchBreakStartJob.setTime(new CronTime(`${min} ${hr} * * *`));
            lunchBreakStartJob.start();
            // lunch end
            hr = +settings.lunch.end.split(":")[0];
            min = +settings.lunch.end.split(":")[1];
            lunchBreakEndJob.setTime(new CronTime(`${min} ${hr} * * *`));
            lunchBreakEndJob.start();
            // snacks start
            hr = +settings.snacks.start.split(":")[0];
            min = +settings.snacks.start.split(":")[1];
            snacksBreakStartJob.setTime(new CronTime(`${min} ${hr} * * *`));
            snacksBreakStartJob.start();
            // snacks end
            hr = +settings.snacks.end.split(":")[0];
            min = +settings.snacks.end.split(":")[1];
            snacksBreakEndJob.setTime(new CronTime(`${min} ${hr} * * *`));
            snacksBreakEndJob.start();
            // office start
            hr = +settings.office.start.split(":")[0];
            min = +settings.office.start.split(":")[1];
            officeStartJob.setTime(new CronTime(`${min} ${hr} * * *`));
            officeStartJob.start();
            // office end
            hr = +settings.office.end.split(":")[0];
            min = +settings.office.end.split(":")[1];
            officeEndJob.setTime(new CronTime(`${min} ${hr} * * *`));
            officeEndJob.start();
        } catch (e) {
            console.log(e);
        }
    },
};
