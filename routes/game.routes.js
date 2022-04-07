"use strict";
const express = require("express");
const router = express.Router();

router.get("/material", async (req, res) => {
    try {
        console.log(`/material called`);
        const gameResp = require(`../models/game.json`);
        const today = new Date().getDay();
        if (gameResp && gameResp[today]) {
            return res
                .status(200)
                .send({ status: true, message: "Games found", data: gameResp[today] });
        }
        return res
            .status(404)
            .send({ status: false, message: "Games not found", data: null });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

router.get("/contents", async (req, res) => {
    try {
        console.log(`/contents called`);
        const gameResp = require(`../models/game.json`);
        if (gameResp) {
            return res
                .status(200)
                .send({ status: true, message: "Games found", data: gameResp });
        }
        return res
            .status(404)
            .send({ status: false, message: "Games not found", data: null });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

module.exports = router;