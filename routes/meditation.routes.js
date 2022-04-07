"use strict";
const express = require("express");
const router = express.Router();

const userDbService = require("../dbops/user.dbops");

router.get("/material", async (req, res) => {
    try {
        console.log(`/material called`);
        const meditationResp = require(`../models/meditation.json`);
        const today = new Date().getDay();
        if (meditationResp && meditationResp[today]) {
            return res
                .status(200)
                .send({ status: true, message: "Meditation link found", data: meditationResp[today] });
        }
        return res
            .status(404)
            .send({ status: false, message: "Meditation link not found", data: null });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

router.get("/contents", async (req, res) => {
    try {
        console.log(`/contents called`);
        const meditationResp = require(`../models/meditation.json`);
        if (meditationResp) {
            return res
                .status(200)
                .send({ status: true, message: "Meditation link found", data: meditationResp });
        }
        return res
            .status(404)
            .send({ status: false, message: "Meditation link not found", data: null });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

router.get("/complete/:username", async (req, res) => {
    try {
        console.log(`/complete/${req.params.username} called`);
        if (req.params.username) {
            const userResp = await userDbService.getAppuserByOptions({ username: req.params.username });
            if (!userResp) {
                return res
                    .status(404)
                    .send({ status: false, message: "User not found", data: null });
            }
            if (!userResp.tags) {
                return res
                    .status(404)
                    .send({ status: false, message: "User tags not found", data: null });
            }
            userResp.tags.lastMeditationTime = +new Date();
            const meditationResp = await userDbService.updateAppuser(userResp);
            if (meditationResp) {
                return res
                    .status(200)
                    .send({ status: true, message: "User's last meditation time updated", data: meditationResp });
            }
            return res
                .status(409)
                .send({ status: false, message: "User's last meditation time not updated", data: null });
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