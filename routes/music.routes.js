"use strict";
const express = require("express");
const router = express.Router();

router.get("/material", async (req, res) => {
    try {
        console.log(`/material called`);
        const musicResp = require(`../models/music.json`);
        const today = new Date().getDay();
        if (musicResp && musicResp[today]) {
            return res
                .status(200)
                .send({ status: true, message: "Meditation link found", data: musicResp[today] });
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
        const musicResp = require(`../models/music.json`);
        if (musicResp) {
            return res
                .status(200)
                .send({ status: true, message: "Music found", data: musicResp });
        }
        return res
            .status(404)
            .send({ status: false, message: "Music not found", data: null });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

module.exports = router;