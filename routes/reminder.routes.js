"use strict";
const express = require("express");
const router = express.Router();

const reminderDbService = require("../dbops/reminder.dbops");
const reminderDbModel = require("../models/reminder.models");
var ObjectId = require('mongoose').Types.ObjectId;

router.get("/:username/:from/:to", async (req, res) => {
    try {
        console.log(`/${req.params.username}/${req.params.from}/${req.params.to} called`);
        if (req.params.username && req.params.from && req.params.to) {
            const reminderResp = await reminderDbService.getAllRemindersByOptions(
                { username: req.params.username, time: { $gte: new Date(+req.params.from), $lt: new Date(+req.params.to) } }
            );
            if (reminderResp) {
                return res
                    .status(200)
                    .send({ status: true, message: "Reminders found", data: reminderResp });
            }
            return res
                .status(404)
                .send({ status: false, message: "Reminders not found", data: [] });
        }
        return res
            .status(400)
            .send({ status: false, message: "Required fields missing", data: null });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

router.put("/:username", async (req, res) => {
    try {
        if (req.body && req.body.message && req.body.time && req.params.username) {
            const reminder = {
                username: req.params.username,
                message: req.body.message,
                time: req.body.time
            };
            const reminderResp = await reminderDbService.saveReminder(new reminderDbModel(reminder));
            console.log("reminderResp", reminderResp);
            if (reminderResp) {
                return res
                    .status(200)
                    .send({ status: true, message: "Reminder added", data: reminderResp });
            }
            return res
                .status(409)
                .send({ status: false, message: "Reminder not added", data: null });
        }
        return res
            .status(400)
            .send({ status: false, message: "Required fields missing", data: null });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

router.delete("/:id", async (req, res) => {
    try {
        console.log(`/${req.params.id} called`);
        if (req.params.id) {
            const reminderResp = await reminderDbService.deleteReminderByOptions({ _id: new ObjectId(req.params.id) });
            if (reminderResp) {
                return res
                    .status(200)
                    .send({ status: true, message: "Reminder deleted", data: reminderResp });
            }
            return res
                .status(409)
                .send({ status: false, message: "Reminder not deleted", data: null });
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