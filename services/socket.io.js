let socketObj = {};
let socketIdMap = {};

const chatDbModel = require("../models/chat.models");
const chatDbService = require("../dbops/chat.dbops");

module.exports = {
    socketObj,
    socketIdMap,
    init: function () {
        global.io.on("connection", (socket) => {
            console.log("socket connected with id:", socket.id);

            socket.on("disconnect", (reason) => {
                console.log("socket disconnected due to reason:", reason);
                socketObj[socketIdMap[socket.id]] = null;
                delete socketObj[socketIdMap[socket.id]];
            });

            socket.on("register", data => {
                console.log("register", data);
                socketObj[data.username] = socket;
                socketIdMap[data.id] = data.username;
            });

            socket.on("message", async data => {
                try {
                    console.log("message", data);
                    if (data && data.from && data.to && data.message) {
                        let chatResp = await chatDbService.saveChat(new chatDbModel(data));
                        if (chatResp) {
                            // on success
                            this.emit(
                                "messageSuccess",
                                { status: true, message: "Message sent", data: chatResp },
                                data.from
                            );
                            this.emit(
                                "message",
                                { status: true, message: "Message received", data: chatResp },
                                data.to
                            );
                        } else {
                            // on failure
                            this.emit(
                                "messageFailure",
                                { status: false, message: "Message could not be sent", data: null },
                                data.from
                            );
                        }
                    } else {
                        // required fields missing
                        this.emit(
                            "messageFailure",
                            { status: false, message: "Required fields missing", data: null },
                            data.from
                        );
                    }
                } catch (e) {
                    console.log(e);
                    this.emit("messageFailure", e, data.from);
                }
            });
        });
    },
    emit: function (topic, data, username = null) {
        if (!username) {
            // broadcast
            console.log("broadcast", topic, data, username);
            global.io.local.emit(topic, data);
            return;
        }
        if (socketObj[username]) {
            socketObj[username].emit(topic, data, (response) => {
                console.log(response);
            });
        } else {
            console.log(`socket for ${username} does not exist`);
        }
    }
};
