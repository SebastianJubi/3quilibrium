const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AppuserSchema = new Schema({
    username: { type: String, required: true, unique: true }, // unique username
    password: { type: String, required: true, default: "password" },
    timestamp: { type: Number, default: +new Date() },
    tags: { type: Schema.Types.Mixed, default: { role: "user" } },
});

const Appuser = mongoose.model("equilibrium_user", AppuserSchema);

AppuserSchema.index({ username: 1, timestamp: 1 });

module.exports = Appuser;