const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReminderSchema = new Schema({
    username: { type: String, required: true },
    message: { type: String, required: true },
    time: { type: Date, required: true },
    timestamp: { type: Number, default: +new Date() },
});

const Appuser = mongoose.model("equilibrium_reminder", ReminderSchema);

ReminderSchema.index({ username: 1, timestamp: 1 });

module.exports = Appuser;