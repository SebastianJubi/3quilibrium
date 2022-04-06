const Reminder = require("../models/reminder.models");

module.exports = {
    saveReminder: (reminder) => {
        return new Promise((resolve, reject) => {
            try {
                if ("_id" in reminder) {
                    delete reminder._id;
                }
                reminder.save((err, msg) => {
                    if (err) {
                        console.log(err);
                        return reject(err);
                    }
                    return resolve(msg);
                });
            } catch (e) {
                console.log(e);
                return reject(e);
            }
        });
    },
    getAllRemindersByOptions: (options) => {
        return new Promise((resolve, reject) => {
            try {
                Reminder.find(options, null, {})
                    .sort({ _id: -1 })
                    .lean()
                    .exec((err, reminders) => {
                        // console.log(reminders);
                        if (err) {
                            console.log(err);
                            return reject(err);
                        }
                        return resolve(reminders);
                    });
            } catch (e) {
                console.log(e);
                return reject(e);
            }
        });
    },
    deleteReminderByOptions: (options) => {
        return new Promise((resolve, reject) => {
            try {
                console.log("Delete", options);
                Reminder.deleteOne(options)
                    .then(() => {
                        console.log("Data deleted");
                        return resolve("success");
                    })
                    .catch(function (error) {
                        console.log(error);
                        return reject(error);
                    });
            } catch (err) {
                console.log(err);
                return reject(err);
            }
        })
    }
};