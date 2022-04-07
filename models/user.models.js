const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AppuserSchema = new Schema({
    username: { type: String, required: true, unique: true }, // unique username
    password: { type: String, required: true, default: "password" },
    tags: { type: Schema.Types.Mixed, default: { role: "user", lastMeditationTime: 0 } },
    timestamp: { type: Number, default: +new Date() },
});

const Appuser = mongoose.model("equilibrium_user", AppuserSchema);

AppuserSchema.index({ username: 1, timestamp: 1 });

module.exports = Appuser;