const Chat = require("../models/chat.models");

module.exports = {
    saveChat: (chat) => {
        return new Promise((resolve, reject) => {
            try {
                if ("_id" in chat) {
                    delete chat._id;
                }
                chat.save((err, msg) => {
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
    getAllChatsByOptions: (options) => {
        return new Promise((resolve, reject) => {
            try {
                Chat.find(options, null, {})
                    .sort({ _id: -1 })
                    .lean()
                    .exec((err, chats) => {
                        // console.log(chats);
                        if (err) {
                            console.log(err);
                            return reject(err);
                        }
                        return resolve(chats);
                    });
            } catch (e) {
                console.log(e);
                return reject(e);
            }
        });
    },
};