"use strict";
const express = require("express");
const router = express.Router();

const userDbService = require("../dbops/user.dbops");
const chatDbService = require("../dbops/chat.dbops");

router.get("/usernames", async (req, res) => {
    try {
        console.log("/usernames called");
        const userResp = await userDbService.getAllAppusers();
        if (userResp && userResp.length > 0) {
            const usernames = userResp.map(user => user.username);
            return res
                .status(200)
                .send({ status: true, message: "Users found", data: usernames });
        }
        return res
            .status(404)
            .send({ status: false, message: "Users not found", data: [] });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

router.get("/messages/:user1/:user2", async (req, res) => {
    try {
        console.log(`/messages/${req.params.user1}/${req.params.user2} called`);
        if (req.params.user1 && req.params.user2) {
            const chatResp = await chatDbService.getAllChatsByOptions(
                {
                    $or: [
                        { from: req.params.user1, to: req.params.user2 },
                        { from: req.params.user2, to: req.params.user1 }
                    ]
                });
            if (chatResp) {
                return res
                    .status(200)
                    .send({ status: true, message: "Chats found", data: chatResp });
            }
            return res
                .status(404)
                .send({ status: false, message: "Chats not found", data: [] });
        }
        return res
            .status(400)
            .send({ status: false, message: "Required fields missing", data: null });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }

});

module.exports = router;