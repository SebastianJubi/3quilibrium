const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatSchema = new Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    timestamp: { type: Number, default: +new Date() },
    message: { type: String, required: true },
});

const Chat = mongoose.model("equilibrium_chat", ChatSchema);

ChatSchema.index({ to: 1, from: 1, timestamp: 1 });

module.exports = Chat;