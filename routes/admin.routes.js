"use strict";
const fs = require("fs");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const userDbService = require("../dbops/user.dbops");
const userDbModel = require("../models/user.models");

const cronService = require("../services/cron");

const isAdminLoggedIn = (req, res, next) => {
    if (!req.user || (req.user.tags && req.user.tags.role !== "admin")) {
        return res.redirect(`${process.env.BASE_URL}/admin/`);
    }
    next();
}

router.post("/login", async (req, res) => {
    try {
        if (req.body && req.body.username && req.body.password) {
            // query admin from db
            let adminResp = await userDbService.getAppuserByOptions(
                {
                    "tags.role": "admin",
                    username: req.body.username,
                    password: req.body.password
                });
            // on success
            if (adminResp) {
                const token = generateAccessToken({ id: adminResp.username });
                return res
                    .status(200)
                    .send({
                        status: true,
                        message: "Login successful",
                        data: adminResp,
                        token
                    });
            }
            // on failure
            return res
                .status(404)
                .send({ status: false, message: "User not found", data: null });
        }
        return res
            .status(400)
            .send({ status: false, message: "Required fields missing", data: null });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

router.post("/createSession", (req, res) => {
    try {
        console.log("/createSession called", req.body);
        req.session.appUser = req.body.appUser;
        req.session.token = req.body.token;
        return res
            .status(200)
            .send({ status: true, message: "ok", appUser: req.body.appUser });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

router.get("/verifySession", isAdminLoggedIn, (req, res) => {
    try {
        console.log("/verifySession called", req.session);
        if (req.session && req.session.appUser && req.session.token) {
            return res
                .status(200)
                .send({ status: true, message: "ok", appUser: req.session.appUser });
        } else {
            return res
                .status(403)
                .send({ status: true, message: "expired or invalid token" });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

router.get("/logout", isAdminLoggedIn, (req, res) => {
    console.log("/logout called");
    req.session.destroy();
    res.clearCookie(process.env.COOKIE_NAME);
    return res.status(200).send({ status: true, message: "logout successful", data: "logout successful" });
});

router.get("/usernames", isAdminLoggedIn, async (req, res) => {
    try {
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

router.put("/add/:username", isAdminLoggedIn, async (req, res) => {
    try {
        const user = {
            username: req.params.username,
        };
        const userResp = await userDbService.addAppuser(new userDbModel(user));
        console.log("userResp", userResp);
        if (userResp) {
            return res
                .status(200)
                .send({ status: true, message: "User added", data: userResp });
        }
        return res
            .status(409)
            .send({ status: false, message: "User not added", data: userResp });
    } catch (e) {
        console.log(e);
        if (e.code === 11000) {
            return res.status(409).send({ status: false, userMessage: "User already exists", data: e });
        }
        return res.status(500).send(e);
    }
});

router.delete("/delete/:username", isAdminLoggedIn, async (req, res) => {
    try {
        const userResp = await userDbService.deleteAppuserByOptions({ username: req.params.username });
        if (userResp) {
            return res
                .status(200)
                .send({ status: true, message: "User deleted", data: userResp });
        }
        return res
            .status(404)
            .send({ status: false, message: "User not deleted", data: userResp });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

router.get("/settings", isAdminLoggedIn, async (req, res) => {
    try {
        const settings = JSON.parse(fs.readFileSync(`./models/settings.json`));
        if (settings) {
            return res
                .status(200)
                .send({ status: true, message: "Settings found", data: settings });
        }
        return res
            .status(404)
            .send({ status: false, message: "Settings not found", data: null });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

router.patch("/settings", isAdminLoggedIn, async (req, res) => {
    try {
        if (req.body && req.body.office && req.body.lunch && req.body.snacks && req.body.meditation) {
            const settings = req.body;
            fs.writeFileSync(
                `./models/settings.json`,
                JSON.stringify(settings)
            );
            cronService.restartCrons(settings);
            return res
                .status(200)
                .send({ status: true, message: "Settings updated", data: settings });
        }
        return res
            .status(400)
            .send({ status: false, message: "Required fields missing", data: null });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

function generateAccessToken(id) {
    try {
        return jwt.sign(id, process.env.SESSION_SECRET, { expiresIn: String(86400000 - (+new Date() - +new Date().setHours(0, 0, 0, 0))) });
    } catch (e) {
        console.log("jwt error", e.message);
        return null;
    }
}

module.exports = router;